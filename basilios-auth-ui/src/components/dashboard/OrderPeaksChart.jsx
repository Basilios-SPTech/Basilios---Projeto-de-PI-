// src/components/dashboard/OrderPeaksChart.jsx
import { useEffect, useState } from "react";
import { http } from "../../services/http.js";
import { HeatMapGrid } from "react-grid-heatmap";

const HOURS = Array.from({ length: 24 }, (_, h) => h); // 0..23
const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/**
 * Constrói matriz [diaSemana][hora] com contagem de pedidos
 * peaks: array de ISO strings
 */
function buildHeatmap(peaks) {
  const data = Array.from({ length: WEEKDAYS.length }, () =>
    Array(HOURS.length).fill(0)
  );

  if (!Array.isArray(peaks)) {
    return { xLabels: HOURS.map((h) => `${h}h`), yLabels: WEEKDAYS, data };
  }

  peaks.forEach((iso) => {
    if (!iso) return;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;

    const jsDay = d.getDay(); // 0 (Dom) .. 6 (Sáb)
    const hour = d.getHours(); // 0..23

    if (hour < 0 || hour > 23) return;

    // Converte pra índice começando em Segunda
    // JS: 0=Dom,1=Seg..6=Sáb  ->  0=Seg..5=Sáb,6=Dom
    const weekdayIndex = jsDay === 0 ? 6 : jsDay - 1;

    data[weekdayIndex][hour] = (data[weekdayIndex][hour] || 0) + 1;
  });

  return {
    xLabels: HOURS.map((h) => `${h}h`),
    yLabels: WEEKDAYS,
    data,
  };
}

export default function OrderPeaksChart({ endpoint, range, rangeVersion }) {
  const [heatmap, setHeatmap] = useState({
    xLabels: [],
    yLabels: [],
    data: [],
  });
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

        const peaks = res.data?.peaks ?? [];
        const built = buildHeatmap(peaks);

        if (!cancelled) {
          setHeatmap(built);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar");
          setHeatmap({ xLabels: [], yLabels: [], data: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPeaks();
    return () => {
      cancelled = true;
    };
  }, [endpoint, range?.start, range?.end, rangeVersion]);

  const { xLabels, yLabels, data } = heatmap;

  const hasAnyValue =
    Array.isArray(data) &&
    data.some((row) => row.some((value) => value && value > 0));

  return (
    <section className="dash-card dash-card--wide dash-card--heatmap">
      <header className="dash-card__header">
        <h3>Picos de pedidos</h3>
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
        ) : !hasAnyValue ? (
          <p className="dash-card__empty">Sem dados para o período.</p>
        ) : (
          <div className="order-heatmap-wrapper">
            <HeatMapGrid
              className="order-heatmap-grid"
              data={data}
              xLabels={xLabels}
              yLabels={yLabels}
              xLabelsPos="top"
              yLabelsPos="left"
              cellHeight="2.6rem"   // aumentado para preencher mais horizontalmente
              square
              xLabelsStyle={(index) => ({
                color: "rgba(17, 17, 17, 0.7)",
                fontSize: ".7rem",
                transform: "translateY(2px)",
              })}
              yLabelsStyle={() => ({
                fontSize: ".7rem",
                textTransform: "uppercase",
                color: "rgba(17, 17, 17, 0.7)",
              })}
              cellStyle={(_x, _y, ratio) => ({
                background: `rgba(187, 53, 48, ${0.12 + ratio * 0.8})`,
                borderRadius: 6,
                fontSize: ".7rem",
                color:
                  ratio > 0.55
                    ? "rgba(255,255,255,0.94)"
                    : "rgba(17,17,17,0.85)",
                transition: "background 0.2s ease, transform 0.2s ease",
              })}
              cellRender={(_x, _y, value) =>
                value > 0 ? <span>{value}</span> : null
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}