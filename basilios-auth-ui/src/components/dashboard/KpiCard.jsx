// src/components/dashboard/KpiCard.jsx
import { useEffect, useState } from "react";
import { http } from "../../services/http.js";
import {
  formatCurrency,
  formatInteger,
  formatPercent,
  formatMinutes,
} from "../../utils/formatters.js";
import { extractSingleValue } from "../../utils/apiMappers.js";

const formatterMap = {
  currency: formatCurrency,
  integer: formatInteger,
  percent: formatPercent,
  minutes: formatMinutes,
};

export default function KpiCard({
  label,
  endpoint,
  range,          // { start, end }
  format = "integer",
  mapResponse,    // opcional: (data) => qualquer valor
}) {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!range?.start || !range?.end) return;

    let cancelled = false;
    async function fetchKpi() {
      try {
        setLoading(true);
        setError("");

        const res = await http.get(endpoint, {
          params: {
            dta_inicio: range.start,
            dta_fim: range.end,
          },
        });

        let raw;
        if (typeof mapResponse === "function") {
          // deixa cada KPI customizar como quiser
          raw = mapResponse(res.data);
        } else {
          raw = extractSingleValue(res.data);
        }

        if (!cancelled) setValue(raw);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar");
          setValue(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchKpi();
    return () => {
      cancelled = true;
    };
  }, [endpoint, range?.start, range?.end, mapResponse]);

  const fn = formatterMap[format] ?? ((v) => v ?? "—");
  const displayValue = fn(value);

  return (
    <article className="kpi-card">
      <header className="kpi-card__header">
        <span className="kpi-card__label">{label}</span>
      </header>

      <div className="kpi-card__body">
        {loading ? (
          <div className="kpi-card__skeleton" />
        ) : error ? (
          <span className="kpi-card__value kpi-card__value--error">
            Erro
          </span>
        ) : (
          <span className="kpi-card__value">{displayValue}</span>
        )}
      </div>

      {error && (
        <p className="kpi-card__hint" title={error}>
          Não foi possível carregar. Tente novamente mais tarde.
        </p>
      )}
    </article>
  );
}
