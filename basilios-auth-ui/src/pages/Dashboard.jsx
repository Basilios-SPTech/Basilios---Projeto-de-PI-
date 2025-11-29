// src/pages/Dashboard.jsx
import { useState } from "react";
import "../styles/dashboard.css";

import KpiCard from "../components/dashboard/KpiCard.jsx";
import OrderPeaksChart from "../components/dashboard/OrderPeaksChart.jsx";
import ChampionProduct from "../components/dashboard/ChampionProduct.jsx";
import TopProducts from "../components/dashboard/TopProducts.jsx";

function getTodayRange() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  // início = primeiro dia do mês, fim = hoje
  return {
    start: `${yyyy}-${mm}-01`,
    end: `${yyyy}-${mm}-${dd}`,
  };
}

export default function Dashboard() {
  const [filters, setFilters] = useState(getTodayRange());
  const [appliedRange, setAppliedRange] = useState(getTodayRange());

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function handleApply(e) {
    e.preventDefault();
    if (!filters.start || !filters.end) return;
    setAppliedRange(filters);
  }

  return (
    <main className="dashboard-root">
      {/* Barra de filtro de data */}
      <section className="dashboard-bar">
        <div className="container">
          <form
            className="dashboard-bar__inner"
            onSubmit={handleApply}
          >
            <div className="dashboard-bar__group">
              <label className="dashboard-bar__field">
                <span>Data início</span>
                <input
                  type="date"
                  name="start"
                  value={filters.start}
                  onChange={handleChange}
                />
              </label>

              <label className="dashboard-bar__field">
                <span>Data fim</span>
                <input
                  type="date"
                  name="end"
                  value={filters.end}
                  onChange={handleChange}
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn--primary dashboard-bar__apply"
            >
              Aplicar
            </button>
          </form>
        </div>
      </section>

      {/* KPIs superiores */}
      <section className="dashboard-section">
        <div className="container">
          <div className="dashboard-kpis">
            <KpiCard
              label="Receita"
              endpoint="/api/dashboard/revenue"
              range={appliedRange}
              format="currency"
            />
            <KpiCard
              label="Pedidos"
              endpoint="/orders"
              range={appliedRange}
              format="integer"
            />
            <KpiCard
              label="Ticket médio"
              endpoint="/api/dashboard/average-ticket"
              range={appliedRange}
              format="currency"
            />
           <KpiCard
  label="Itens vendidos"
  endpoint="/api/dashboard/items-sold"
  range={appliedRange}
  format="integer"
  mapResponse={(data) => {
    // data = { productsNotSold: 10, itemsSold: 24 }
    if (!data) return null;
    // se vier string, Number já resolve
    return Number(data.itemsSold ?? 0);
  }}
/>

            <KpiCard
              label="cancelamento"
              endpoint="/dashboard/cancellation-rate"
              range={appliedRange}
              format="percent"
            />
            <KpiCard
              label="Média entrega"
              endpoint="/dashboard/average-delivery-time"
              range={appliedRange}
              format="minutes"
            />
          </div>
        </div>
      </section>

      {/* Bloco dos gráficos grandes */}
      <section className="dashboard-section dashboard-section--charts">
        <div className="container">
          <div className="dashboard-charts">
            <OrderPeaksChart
              endpoint="/dashboard/order-peaks"
              range={appliedRange}
            />

            <div className="dashboard-charts__side">
              <ChampionProduct
                endpoint="/dashboard/champion"
                range={appliedRange}
              />
              <TopProducts
                endpoint="/dashboard/top-products"
                range={appliedRange}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
