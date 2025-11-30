import { useEffect, useState } from "react";
import { http } from "../../services/http.js";

export default function TopProducts({ endpoint, range, rangeVersion }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!range?.start || !range?.end) return;

    let cancelled = false;

    async function fetchTopProducts() {
      try {
        setLoading(true);
        setError("");

        const res = await http.get(endpoint, {
          params: {
            dta_inicio: range.start,
            dta_fim: range.end,
            limit: 5, // bate com o que você já está passando na URL
          },
        });

        const raw = Array.isArray(res.data) ? res.data : [];

        const normalized = raw.slice(0, 5).map((p) => ({
          id: p.productId ?? p.id ?? p.name,
          name: p.name ?? "Produto",
          unitsSold: p.unitsSold ?? 0,
        }));

        if (!cancelled) {
          setItems(normalized);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erro ao carregar");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTopProducts();
    return () => {
      cancelled = true;
    };
  }, [endpoint, range?.start, range?.end, rangeVersion]);

  return (
    <section className="dash-card dash-card--tall">
      <header className="dash-card__header">
        <h3>Top produtos</h3>
      </header>

      <div className="dash-card__content">
        {loading ? (
          <div className="list-skeleton" />
        ) : error ? (
          <p className="dash-card__error">
            Não foi possível carregar o ranking de produtos.
          </p>
        ) : items.length === 0 ? (
          <p className="dash-card__empty">Sem dados para o período.</p>
        ) : (
          <ol className="top-products">
            {items.map((item, index) => (
              <li key={item.id} className="top-products__item">
                <span className="top-products__rank">{index + 1}º</span>
                <div className="top-products__info">
                  <span className="top-products__name">
                    {item.name}
                  </span>
                  <span className="top-products__qty">
                    {item.unitsSold} vendidos
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
