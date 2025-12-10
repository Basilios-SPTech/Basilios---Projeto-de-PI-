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
  if (value == null) return "—";
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return "—";
  return `${Math.round(n)} min`;
}
