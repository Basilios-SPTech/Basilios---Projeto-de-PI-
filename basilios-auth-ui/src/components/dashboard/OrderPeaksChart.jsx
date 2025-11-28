// src/components/dashboard/OrderPeaksChart.jsx
import { useEffect, useState, useMemo } from "react";
import { http } from "../../services/http.js";

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
            startDate: range.start,
            endDate: range.end,
          },
        });

        // Ajuste esse mapping de acordo com o que seu backend devolver
        const raw = res.data || [];
        const normalized = raw.map((item, idx) => ({
          // ex.: dia/hora concatenados ou uma label que venha do backend
          label: item.label ?? item.slot ?? `Pico ${idx + 1}`,
          value: item.count ?? item.total ?? 0,
        }));

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
