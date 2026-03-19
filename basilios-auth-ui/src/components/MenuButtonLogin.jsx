/** Botão suspenso que chama a nossa side bar user*/

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import SidebarLogin from "./SideBarLogin.jsx";

export default function SidebarToggle({
  label = "Abrir menu",
  side = "left",          // "left" | "right"
  offset = 16,            // px do topo e da lateral
  className = "",
  sidebarProps = {}
}) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hideTimer = useRef(null);
  const isLeft = side === "left";

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setRevealed(false);
  }, [open]);

  const handleZoneEnter = useCallback(() => {
    clearTimeout(hideTimer.current);
    if (!open) setRevealed(true);
  }, [open]);

  const handleZoneLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setRevealed(false), 400);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const btnStyle = useMemo(
    () => ({
      top: offset,
      [isLeft ? "left" : "right"]: offset,
    }),
    [offset, isLeft]
  );

  const close = () => setOpen(false);

  return (
    <>
      {/* ZONA DE DETECÇÃO — invisível, cobre o canto para detectar hover/touch */}
      <div
        onMouseEnter={handleZoneEnter}
        onMouseLeave={handleZoneLeave}
        onTouchStart={handleZoneEnter}
        style={{
          position: "fixed",
          top: 0,
          [isLeft ? "left" : "right"]: 0,
          width: 72,
          height: 72,
          zIndex: 939,
        }}
        aria-hidden="true"
      />

      {/* BOTÃO — aparece com animação quando revealed */}
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        onMouseEnter={handleZoneEnter}
        onMouseLeave={handleZoneLeave}
        style={btnStyle}
        className={[
          "fixed z-[940] h-11 w-11",
          "rounded-full border border-black/10 bg-white/95 backdrop-blur",
          "shadow-lg hover:shadow-xl active:scale-95",
          "grid place-items-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40",
          "transition-all duration-300 ease-out",
          open
            ? "opacity-0 pointer-events-none scale-75"
            : revealed
              ? "opacity-100 scale-100 translate-x-0 translate-y-0"
              : isLeft
                ? "opacity-0 pointer-events-none -translate-x-3 -translate-y-1 scale-90"
                : "opacity-0 pointer-events-none translate-x-3 -translate-y-1 scale-90",
          className
        ].join(" ")}
      >
        <svg
          width="22" height="22" viewBox="0 0 24 24" fill="none"
          aria-hidden="true"
          className={`transition-transform duration-300 ${
            revealed ? "rotate-0" : "-rotate-90"
          }`}
        >
          <path d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" />
        </svg>
        <span className="sr-only">{label}</span>
      </button>

      {/* OVERLAY + SUA SIDEBAR */}
      {open && (
        <div className="fixed inset-0 z-[900]">
          <div
            role="button"
            tabIndex={0}
            className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]"
            onClick={close}
            onKeyDown={(e) => e.key === "Enter" && close()}
            aria-label="Fechar menu"
          />
          <div className="absolute inset-0 z-[950] pointer-events-none">
            <div className="pointer-events-auto">
              <SidebarLogin
                // cobre APIs comuns
                open={open}
                isOpen={open}
                visible={open}
                show={open}
                onClose={close}
                close={close}
                setOpen={setOpen}
                {...sidebarProps}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
