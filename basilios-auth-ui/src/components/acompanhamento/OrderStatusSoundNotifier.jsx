import { useEffect, useMemo, useRef, useState } from "react";
import { Howl, Howler } from "howler";

const SOUND_DEBOUNCE_MS = 3000;

const ACTIVE_STATUSES = ["PENDENTE", "CONFIRMADO", "PREPARANDO", "DESPACHADO"];

// Fallback tiny beep in case WAV encoding fails for any reason.
const FALLBACK_WAV_DATA_URI =
  "data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAAAAAAAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8AAP//AAAA//8=";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothEnvelope(t, start, attack, decay) {
  if (t < start) return 0;

  const rel = t - start;
  if (rel <= attack) return rel / attack;

  return Math.exp(-(rel - attack) * decay);
}

function createPremiumNotificationDataUri() {
  try {
    const sampleRate = 44100;
    const durationSec = 0.78;
    const sampleCount = Math.floor(sampleRate * durationSec);
    const samples = new Float32Array(sampleCount);

    for (let i = 0; i < sampleCount; i += 1) {
      const t = i / sampleRate;

      const envA = smoothEnvelope(t, 0.0, 0.012, 6.8);
      const envB = smoothEnvelope(t, 0.115, 0.014, 6.1);
      const envC = smoothEnvelope(t, 0.265, 0.014, 6.8);

      const noteA =
        envA *
        (0.62 * Math.sin(2 * Math.PI * 784 * t) +
          0.17 * Math.sin(2 * Math.PI * 1568 * t));

      const noteB =
        envB *
        (0.5 * Math.sin(2 * Math.PI * 987.77 * t) +
          0.14 * Math.sin(2 * Math.PI * 1975.54 * t));

      const noteC =
        envC *
        (0.44 * Math.sin(2 * Math.PI * 1174.66 * t) +
          0.12 * Math.sin(2 * Math.PI * 2349.32 * t));

      // Slight vibrato gives a less robotic and more premium feel.
      const vibrato = 1 + 0.0028 * Math.sin(2 * Math.PI * 5.8 * t);

      samples[i] = (noteA + noteB + noteC) * vibrato;
    }

    // Soft echo tail for a cleaner premium chime feel.
    const delaySamples = Math.floor(sampleRate * 0.105);
    for (let i = delaySamples; i < sampleCount; i += 1) {
      samples[i] += samples[i - delaySamples] * 0.22;
    }

    // Normalize safely.
    let peak = 0;
    for (let i = 0; i < sampleCount; i += 1) {
      const abs = Math.abs(samples[i]);
      if (abs > peak) peak = abs;
    }
    const gain = peak > 0 ? 0.92 / peak : 1;

    const dataSize = sampleCount * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeAscii = (offset, value) => {
      for (let i = 0; i < value.length; i += 1) {
        view.setUint8(offset + i, value.charCodeAt(i));
      }
    };

    writeAscii(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeAscii(8, "WAVE");
    writeAscii(12, "fmt ");
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // audio format PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeAscii(36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < sampleCount; i += 1) {
      const s = clamp(samples[i] * gain, -1, 1);
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }

    if (typeof btoa === "function") {
      return `data:audio/wav;base64,${btoa(binary)}`;
    }

    if (typeof Buffer !== "undefined") {
      return `data:audio/wav;base64,${Buffer.from(bytes).toString("base64")}`;
    }

    return FALLBACK_WAV_DATA_URI;
  } catch {
    return FALLBACK_WAV_DATA_URI;
  }
}

export default function OrderStatusSoundNotifier({ status, enabled = true }) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const previousStatusRef = useRef(null);
  const lastPlayAtRef = useRef(0);
  const soundRef = useRef(null);

  const notificationSrc = useMemo(() => createPremiumNotificationDataUri(), []);

  const canTrackStatus = useMemo(
    () => enabled && ACTIVE_STATUSES.includes(String(status || "")),
    [enabled, status],
  );

  useEffect(() => {
    soundRef.current = new Howl({
      src: [notificationSrc],
      volume: 0.62,
      preload: true,
      html5: false,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      soundRef.current = null;
    };
  }, [notificationSrc]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlockAudio = async () => {
      try {
        if (Howler?.ctx?.state === "suspended") {
          await Howler.ctx.resume();
        }
      } catch {
        // noop
      }

      setAudioUnlocked(true);
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
      window.removeEventListener("touchstart", unlockAudio, true);
    };

    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    window.addEventListener("touchstart", unlockAudio, true);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
      window.removeEventListener("touchstart", unlockAudio, true);
    };
  }, []);

  useEffect(() => {
    if (!canTrackStatus) {
      previousStatusRef.current = null;
      return;
    }

    const nextStatus = String(status);
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = nextStatus;

    if (!audioUnlocked) return;
    if (!previousStatus || previousStatus === nextStatus) return;

    const now = Date.now();
    if (now - lastPlayAtRef.current < SOUND_DEBOUNCE_MS) return;

    lastPlayAtRef.current = now;

    try {
      soundRef.current?.play();
    } catch {
      // noop
    }
  }, [status, canTrackStatus, audioUnlocked]);

  return null;
}
