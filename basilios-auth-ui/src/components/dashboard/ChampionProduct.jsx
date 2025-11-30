import { useEffect, useState } from "react";
import { http } from "../../services/http.js";
import { formatInteger } from "../../utils/formatters.js";

export default function ChampionProduct({ endpoint, range, rangeVersion }) {
  const [champions, setChampions] = useState([]);  // agora é array
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
            dta_inicio: range.start,
            dta_fim: range.end,
          },
        });

        const raw = res.data;

        let list = [];
        if (Array.isArray(raw)) {
          // caso o backend passe a devolver um array de campeões empatados
          list = raw;
        } else if (raw) {
          // caso continue mandando só um campeão
          list = [raw];
        }

        const normalized = list.map((data) => ({
          id: data.productId ?? data.id ?? null,
          name: data.name ?? "Indeterminado",
          unitsSold: data.unitsSold ?? data.totalSold ?? 0,
          onPromotion: Boolean(data.onPromotion),
        }));

        if (!cancelled) {
          setChampions(normalized);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar");
          setChampions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChampion();
    return () => {
      cancelled = true;
    };
  }, [endpoint, range?.start, range?.end, rangeVersion]);

  const hasData = champions && champions.length > 0;

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
        ) : !hasData ? (
          <p className="dash-card__empty">Sem dados para o período.</p>
        ) : (
          <div className={`champion ${champions.length > 1 ? "champion--multi" : ""}`}>
            <div className="champion__info-list">
              {champions.map((c) => (
                <div
                  key={c.id ?? c.name}
                  className="champion__info champion__info--row"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h4 className="champion__name">{c.name}</h4>

                    {c.onPromotion && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#fff5f5",
                          color: "var(--bsl-red, #BB3530)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Promoção
                      </span>
                    )}
                  </div>

                  <p className="champion__metric">
                    <span className="champion__metric-label">
                      Unidades vendidas:
                    </span>
                    <span className="champion__metric-value">
                      {formatInteger(c.unitsSold)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}