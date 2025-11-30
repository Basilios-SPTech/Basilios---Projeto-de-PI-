// src/pages/Dashboard.jsx
import { useState } from "react";
import "../styles/dashboard.css";

import KpiCard from "../components/dashboard/KpiCard.jsx";
import OrderPeaksChart from "../components/dashboard/OrderPeaksChart.jsx";
import ChampionProduct from "../components/dashboard/ChampionProduct.jsx";
import TopProducts from "../components/dashboard/TopProducts.jsx";
import MenuButton from "../components/MenuButtonAdm.jsx";

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
  const [appliedVersion, setAppliedVersion] = useState(0);

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function handleApply(e) {
    e.preventDefault();
    if (!filters.start || !filters.end) return;
    setAppliedRange(filters);
    setAppliedVersion((v) => v + 1);
  }

  return (
    <main className="dashboard-root">
        <MenuButton />
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
              rangeVersion={appliedVersion}
              format="currency"
            />
            <KpiCard
             label="Pedidos"
             endpoint="/api/dashboard/orders"
             range={appliedRange}
             rangeVersion={appliedVersion}
             format="integer"
             mapResponse={(data) => {
             // data = { orders: 20 }
            if (!data) return null;
            return Number(data.orders ?? 0);
            }}
            />
            <KpiCard
              label="Ticket médio"
              endpoint="/api/dashboard/average-ticket"
              range={appliedRange}
              rangeVersion={appliedVersion}
              format="currency"
            />
            <KpiCard
              label="Itens vendidos"
              endpoint="/api/dashboard/items-sold"
              range={appliedRange}
              rangeVersion={appliedVersion}
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
            endpoint="/api/dashboard/cancellation-rate"
            range={appliedRange}
            rangeVersion={appliedVersion}
            format="percent"
            mapResponse={(data) => {
            if (!data) return null;
            // data = { cancellationRate: 10.0 }
            return Number(data.cancellationRate ?? 0);
            }}
            />

            <KpiCard
              label="Média entrega"
              endpoint="api/dashboard/average-delivery-time"
              range={appliedRange}
              rangeVersion={appliedVersion}
              format="minutes"
            />
          </div>
        </div>
      </section>

      {/* Bloco dos gráficos grandes */}
      <section className="dashboard-section dashboard-section--charts">
        <div className="container">
          {/* Linha 1: Picos de pedidos ocupando a largura toda */}
          <div className="dashboard-charts dashboard-charts--full">
            <OrderPeaksChart
              endpoint="/api/dashboard/order-peaks"
              range={appliedRange}
              rangeVersion={appliedVersion}
            />
          </div>

          {/* Linha 2: Campeão de vendas + Top produtos */}
          <div className="dashboard-charts dashboard-charts--bottom">
            <ChampionProduct
              endpoint="/api/dashboard/champion"
              range={appliedRange}
              rangeVersion={appliedVersion}
            />
            <TopProducts
              endpoint="/api/dashboard/top-products"
              range={appliedRange}
              rangeVersion={appliedVersion}
            />
          </div>
        </div>
      </section>

    </main>
  );
}
