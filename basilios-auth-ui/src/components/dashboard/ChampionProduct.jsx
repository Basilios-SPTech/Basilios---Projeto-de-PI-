// src/components/dashboard/ChampionProduct.jsx
import { useEffect, useState } from "react";
import { http } from "../../services/http.js";
import { formatCurrency, formatInteger } from "../../utils/formatters.js";

export default function ChampionProduct({ endpoint, range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!range?.start || !range?.end) return;

    let cancelled = false;

    async function fetchChampion() {
      try {
        setLoading(true);
        setError("");

        const res = await http.get(endpoint, {
          params: {
            startDate: range.start,
            endDate: range.end,
          },
        });

        // Ajuste campos conforme resposta real do backend
        const raw = res.data;
        const normalized = raw && {
          name: raw.name ?? raw.productName ?? "Produto campeão",
          totalSold: raw.totalSold ?? raw.quantity ?? 0,
          revenue: raw.revenue ?? raw.totalRevenue ?? null,
          imageUrl: raw.imageUrl ?? raw.image ?? null,
        };

        if (!cancelled) setData(normalized);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChampion();
    return () => {
      cancelled = true;
    };
  }, [endpoint, range?.start, range?.end]);

  return (
    <section className="dash-card dash-card--champion">
      <header className="dash-card__header">
        <h3>Campeão de vendas</h3>
      </header>

      <div className="dash-card__content">
        {loading ? (
          <div className="card-skeleton" />
        ) : error ? (
          <p className="dash-card__error">
            Não foi possível carregar o campeão de vendas.
          </p>
        ) : !data ? (
          <p className="dash-card__empty">Sem dados para o período.</p>
        ) : (
          <div className="champion">
            {data.imageUrl && (
              <div className="champion__image-wrap">
                <img
                  src={data.imageUrl}
                  alt={data.name}
                  className="champion__image"
                />
              </div>
            )}

            <div className="champion__info">
              <h4 className="champion__name">{data.name}</h4>

              <p className="champion__metric">
                <span className="champion__metric-label">
                  Itens vendidos
                </span>
                <span className="champion__metric-value">
                  {formatInteger(data.totalSold)}
                </span>
              </p>

              {data.revenue != null && (
                <p className="champion__metric">
                  <span className="champion__metric-label">Receita</span>
                  <span className="champion__metric-value">
                    {formatCurrency(data.revenue)}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
