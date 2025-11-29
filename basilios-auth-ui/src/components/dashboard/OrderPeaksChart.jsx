import { useEffect, useState, useMemo } from "react";
import { http } from "../../services/http.js";

function buildPeaks(data) {
  if (!Array.isArray(data)) return [];

  const counts = {};

  data.forEach((iso) => {
    if (!iso) return;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;

    const label = d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12); // mostra só os 12 maiores picos
}

export default function OrderPeaksChart({ endpoint, range }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!range?.start || !range?.end) return;

    let cancelled = false;
    async function fetchPeaks() {
      try {
        setLoading(true);
        setError("");

        const res = await http.get(endpoint, {
          params: {
            dta_inicio: range.start,
            dta_fim: range.end,
          },
        });

        const normalized = buildPeaks(res.data);

        if (!cancelled) setPoints(normalized);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar");
          setPoints([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPeaks();
    return () => {
      cancelled = true;
    };
  }, [endpoint, range?.start, range?.end]);

  const maxValue = useMemo(
    () => Math.max(0, ...points.map((p) => p.value)),
    [points]
  );

  return (
    <section className="dash-card dash-card--wide">
      <header className="dash-card__header">
        <h3>Picos de pedido</h3>
        {range?.start && range?.end && (
          <span className="dash-card__range">
            {range.start} — {range.end}
          </span>
        )}
      </header>

      <div className="dash-card__content">
        {loading ? (
          <div className="chart-skeleton" />
        ) : error ? (
          <p className="dash-card__error">
            Não foi possível carregar os picos de pedido.
          </p>
        ) : points.length === 0 ? (
          <p className="dash-card__empty">Sem dados para o período.</p>
        ) : (
          <div className="order-peaks">
            {points.map((p) => {
              const height =
                maxValue > 0 ? (p.value / maxValue) * 100 : 0;

              return (
                <div key={p.label} className="order-peaks__item">
                  <div className="order-peaks__bar-wrap">
                    <div
                      className="order-peaks__bar"
                      style={{ "--bar-height": `${height}%` }}
                    />
                  </div>
                  <span className="order-peaks__label">{p.label}</span>
                  <span className="order-peaks__value">{p.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
