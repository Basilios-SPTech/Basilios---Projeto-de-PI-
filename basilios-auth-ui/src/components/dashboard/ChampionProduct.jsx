import { useEffect, useState } from "react";
import { http } from "../../services/http.js";
import { extractStringArray, extractSingleValue } from "../../utils/apiMappers.js";

export default function ChampionProduct({ endpoint, range }) {
  const [name, setName] = useState("");
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

        // se vier string pura ou obj com 1 valor
        let value = extractSingleValue(res.data);
        if (Array.isArray(res.data)) {
          // se no futuro resolverem mandar array, pega o primeiro
          const arr = extractStringArray(res.data);
          value = arr[0] ?? "";
        }

        if (!cancelled) {
          setName(value ? String(value) : "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar");
          setName("");
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
        ) : !name ? (
          <p className="dash-card__empty">Sem dados para o período.</p>
        ) : (
          <div className="champion">
            <div className="champion__info">
              <h4 className="champion__name">{name}</h4>
              <p className="champion__metric">
                <span className="champion__metric-label">
                  Produto mais vendido no período
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
