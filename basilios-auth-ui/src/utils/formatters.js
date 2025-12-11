// src/utils/formatters.js
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return currencyFormatter.format(Number(value));
}

export function formatInteger(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toLocaleString("pt-BR");
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(1)}%`;
}

export function formatMinutes(value) {
  // Accept seconds as input and return a human-friendly duration string.
  // Examples:
  //  - 45   -> "0:45" (mm:ss)
  //  - 1807 -> "30:07"
  //  - 3750 -> "1h:02"
  if (value == null) return "—";
  const secs = Number(value);
  if (!Number.isFinite(secs) || Number.isNaN(secs)) return "—";

  const s = Math.max(0, Math.round(secs));
  if (s < 60) {
    return `${s}s`;
  }

  const hrs = Math.floor(s / 3600);
  const mins = Math.round((s % 3600) / 60);

  // If less than one hour, show rounded minutes with unit, e.g. "30 min"
  if (hrs === 0) {
    return `${mins} min`;
  }

  // For hours, show HH:MMh (pad minutes). Example: 3600 -> "01:00h", 3660 -> "01:01h"
  const displayHours = String(hrs).padStart(2, "0");
  const displayMins = String(mins).padStart(2, "0");
  return `${displayHours}:${displayMins}h`;
}
