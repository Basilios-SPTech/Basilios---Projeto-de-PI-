import { useState, useEffect, useCallback } from "react";
import { http } from "../services/http.js";

const WEEK_DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

const DAY_LABELS = {
    MONDAY: "Segunda",
    TUESDAY: "Terça",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

const DAY_ALIASES = {
    SEGUNDA: "MONDAY",
    TERCA: "TUESDAY",
    QUARTA: "WEDNESDAY",
    QUINTA: "THURSDAY",
    SEXTA: "FRIDAY",
    SABADO: "SATURDAY",
    DOMINGO: "SUNDAY",
};

const JS_DAY_TO_WEEK_DAY = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
};

function normalizeDay(value) {
    const raw = String(value || "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (!raw) return "";
    if (WEEK_DAYS.includes(raw)) return raw;
    return DAY_ALIASES[raw] || "";
}

function parseTimeToMinutes(value) {
    if (value == null) return null;

    if (typeof value === "string") {
        const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
        if (!match) return null;
        const hour = Number(match[1]);
        const minute = Number(match[2]);
        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
        return hour * 60 + minute;
    }

    if (typeof value === "object") {
        const hour = Number(value.hour);
        const minute = Number(value.minute);
        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
        return hour * 60 + minute;
    }

    return null;
}

function formatMinutes(minutes) {
    if (!Number.isFinite(minutes)) return "--:--";
    const normalized = ((Math.floor(minutes) % 1440) + 1440) % 1440;
    const hour = Math.floor(normalized / 60);
    const minute = normalized % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function normalizeHours(hours) {
    const source = Array.isArray(hours) ? hours : [];

    return source
        .map((item) => {
            const day = normalizeDay(item?.day_of_week ?? item?.dayOfWeek);
            return {
                day,
                isClosed: Boolean(item?.is_closed ?? item?.isClosed),
                opensAt: parseTimeToMinutes(item?.opens_at ?? item?.opensAt),
                closesAt: parseTimeToMinutes(item?.closes_at ?? item?.closesAt),
                timeWindowValid: item?.timeWindowValid == null ? true : Boolean(item.timeWindowValid),
            };
        })
        .filter((item) => Boolean(item.day));
}

function getNextDay(day) {
    const index = WEEK_DAYS.indexOf(day);
    if (index < 0) return "";
    return WEEK_DAYS[(index + 1) % WEEK_DAYS.length];
}

function isWindowActive(entry, currentDay, currentMinutes) {
    if (!entry || entry.isClosed || !entry.timeWindowValid) return false;
    if (!Number.isFinite(entry.opensAt) || !Number.isFinite(entry.closesAt)) return false;

    if (entry.opensAt === entry.closesAt) return false;

    if (entry.closesAt > entry.opensAt) {
        return (
            currentDay === entry.day &&
            currentMinutes >= entry.opensAt &&
            currentMinutes < entry.closesAt
        );
    }

    const nextDay = getNextDay(entry.day);
    return (
        (currentDay === entry.day && currentMinutes >= entry.opensAt) ||
        (currentDay === nextDay && currentMinutes < entry.closesAt)
    );
}

function getUpcomingOpening(entries, currentDay, currentMinutes) {
    const currentIndex = WEEK_DAYS.indexOf(currentDay);
    if (currentIndex < 0) return null;

    let best = null;

    for (const entry of entries) {
        if (!entry || entry.isClosed || !entry.timeWindowValid) continue;
        if (!Number.isFinite(entry.opensAt) || !Number.isFinite(entry.closesAt)) continue;
        if (entry.opensAt === entry.closesAt) continue;

        const entryIndex = WEEK_DAYS.indexOf(entry.day);
        if (entryIndex < 0) continue;

        let delta = (entryIndex - currentIndex) * 1440 + (entry.opensAt - currentMinutes);
        if (delta <= 0) {
            delta += 7 * 1440;
        }

        if (!best || delta < best.deltaMinutes) {
            best = { ...entry, deltaMinutes: delta };
        }
    }

    return best;
}

function buildBusinessHoursSummary(entries) {
    return WEEK_DAYS.map((day) => {
        const dayEntries = entries.filter((entry) => entry.day === day);

        const windows = dayEntries
            .filter(
                (entry) =>
                    !entry.isClosed &&
                    entry.timeWindowValid &&
                    Number.isFinite(entry.opensAt) &&
                    Number.isFinite(entry.closesAt) &&
                    entry.opensAt !== entry.closesAt,
            )
            .sort((a, b) => a.opensAt - b.opensAt)
            .map((entry) => `${formatMinutes(entry.opensAt)} - ${formatMinutes(entry.closesAt)}`);

        const anyClosedFlag = dayEntries.some((entry) => entry.isClosed);

        let text = "Sem horário";
        if (windows.length > 0) text = windows.join(" | ");
        else if (anyClosedFlag) text = "Fechado";

        return `${DAY_LABELS[day]}: ${text}`;
    }).join("\n");
}

function computeStoreStatus(entries) {
    const now = new Date();
    const currentDay = JS_DAY_TO_WEEK_DAY[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const activeEntry = entries.find((entry) =>
        isWindowActive(entry, currentDay, currentMinutes),
    );

    const businessHours = buildBusinessHoursSummary(entries);

    if (activeEntry) {
        const closesText = formatMinutes(activeEntry.closesAt);
        return {
            open: true,
            message: `Aberta agora. Fecha às ${closesText}.`,
            businessHours,
        };
    }

    const nextOpening = getUpcomingOpening(entries, currentDay, currentMinutes);

    if (!nextOpening) {
        return {
            open: false,
            message: "Loja fechada no momento.",
            businessHours,
        };
    }

    const nextDayLabel = DAY_LABELS[nextOpening.day] || nextOpening.day;
    const nextHourText = formatMinutes(nextOpening.opensAt);
    const isToday = nextOpening.deltaMinutes < 1440;

    return {
        open: false,
        message: isToday
            ? `Loja fechada no momento. Abre hoje às ${nextHourText}.`
            : `Loja fechada no momento. Próxima abertura: ${nextDayLabel} às ${nextHourText}.`,
        businessHours,
    };
}

let sharedHours = [];
let sharedStatus = null;
let sharedLoading = true;
let sharedError = null;
let tickIntervalId = null;
let inFlightRequest = null;
let activeConsumers = 0;
let lastSuccessfulFetchAt = 0;
const subscribers = new Set();

const NETWORK_REFRESH_TTL_MS = 15 * 60 * 1000;

function getSnapshot() {
    return {
        status: sharedStatus,
        loading: sharedLoading,
        error: sharedError,
    };
}

function emitSnapshot() {
    const snapshot = getSnapshot();
    subscribers.forEach((listener) => {
        try {
            listener(snapshot);
        } catch {
            // noop
        }
    });
}

function setSharedStatus(nextStatus) {
    const previous = sharedStatus;
    const hasChanged =
        !previous ||
        previous.open !== nextStatus?.open ||
        previous.message !== nextStatus?.message ||
        previous.businessHours !== nextStatus?.businessHours;

    if (hasChanged) {
        sharedStatus = nextStatus;
        emitSnapshot();
    }
}

function recomputeSharedStatus() {
    setSharedStatus(computeStoreStatus(sharedHours));
}

function shouldRefreshFromNetwork(force = false) {
    if (force) return true;
    if (lastSuccessfulFetchAt <= 0) return true;
    return Date.now() - lastSuccessfulFetchAt >= NETWORK_REFRESH_TTL_MS;
}

async function fetchStoreHours({ force = false, showLoading = false } = {}) {
    if (!shouldRefreshFromNetwork(force)) {
        if (sharedStatus == null && sharedHours.length > 0) {
            recomputeSharedStatus();
        }
        return null;
    }

    if (inFlightRequest) return inFlightRequest;

    if (showLoading || sharedStatus == null) {
        sharedLoading = true;
        emitSnapshot();
    }

    inFlightRequest = (async () => {
        try {
            const response = await http.get("/store/hours");
            const payload = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.hours)
                    ? response.data.hours
                    : [];

            sharedHours = normalizeHours(payload);
            recomputeSharedStatus();
            sharedError = null;
            lastSuccessfulFetchAt = Date.now();
        } catch (err) {
            sharedError = "Erro ao verificar status da loja";
            console.error("Erro ao verificar status da loja:", err);
        } finally {
            sharedLoading = false;
            emitSnapshot();
            inFlightRequest = null;
        }
    })();

    return inFlightRequest;
}

function ensureLifecycleStarted() {
    if (!tickIntervalId) {
        tickIntervalId = setInterval(recomputeSharedStatus, 30 * 1000);
    }

    if (sharedStatus == null) {
        void fetchStoreHours({ force: true, showLoading: true });
        return;
    }

    recomputeSharedStatus();
}

function ensureLifecycleStopped() {
    if (activeConsumers > 0) return;

    if (tickIntervalId) {
        clearInterval(tickIntervalId);
        tickIntervalId = null;
    }
}

export const useBusinessHours = () => {
    const [snapshot, setSnapshot] = useState(() => getSnapshot());

    const checkStoreStatus = useCallback(async ({ force = true, showLoading = false } = {}) => {
        await fetchStoreHours({ force, showLoading });
        return getSnapshot().status;
    }, []);

    useEffect(() => {
        activeConsumers += 1;

        const listener = (nextSnapshot) => {
            setSnapshot(nextSnapshot);
        };

        subscribers.add(listener);
        setSnapshot(getSnapshot());
        ensureLifecycleStarted();

        return () => {
            subscribers.delete(listener);
            activeConsumers = Math.max(activeConsumers - 1, 0);
            ensureLifecycleStopped();
        };
    }, []);

    return {
        status: snapshot.status,
        loading: snapshot.loading,
        error: snapshot.error,
        checkStoreStatus,
    };
};
