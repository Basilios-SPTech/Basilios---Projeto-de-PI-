// src/pages/AnalyticsAdm.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { analyticsApi } from '../services/analyticsApi'
import { aggregateFromMenu, fmtCurrency, fmtInt } from '../utils/analytics'
import { DateRangeBar } from '../components/analytics/DateRangeBar'
import { KpiCard } from '../components/analytics/KpiCard'
import { Heatmap } from '../components/analytics/Heatmap'
import { TopProducts } from '../components/analytics/TopProducts'
import { ChampionCard } from '../components/analytics/ChampionCard'
import { toast } from 'react-hot-toast'             
import '../styles/analytics.css'
import MenuButton from "../components/MenuButtonAdm.jsx";


function isoLocalDate(d) {
  return d.toISOString().slice(0, 10)
}
function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export default function AnalyticsAdm() {
  // Período padrão: últimos 7 dias
  const today = useMemo(() => new Date(), [])
  const defaultStart = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d
  }, [])

  const [dateRange, setDateRange] = useState({
    start: isoLocalDate(defaultStart),
    end: isoLocalDate(today),
  })
  const [loading, setLoading] = useState(false)
  const [agg, setAgg] = useState(null)

  useEffect(() => {
    applyRange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function applyRange() {
    setLoading(true)
    const abort = new AbortController()
    try {
      const data = await analyticsApi.getMenu(abort.signal)
      const start = startOfDay(new Date(dateRange.start))
      const end = endOfDay(new Date(dateRange.end))
      const a = aggregateFromMenu(data, start, end)
      setAgg(a)
    } catch (err) {
      // ✅ erro via toast (pequeno, bonito)
      toast.error(err?.message || 'Falha ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ana-page">
      <MenuButton />
      <main className="ana-content">
        <div className="ana-container">
          <DateRangeBar
            start={dateRange.start}
            end={dateRange.end}
            onChange={setDateRange}
            onApply={applyRange}
            loading={loading}
          />

          {/* KPIs */}
          <section className="ana-grid kpis">
            <KpiCard label="Receita (itens)" value={fmtCurrency(agg?.receitaItens || 0)} />
            <KpiCard label="Pedidos" value={fmtInt(agg?.pedidos || 0)} />
            <KpiCard label="Ticket médio" value={fmtCurrency(agg?.ticketMedio || 0)} />
            <KpiCard label="Itens vendidos" value={fmtInt(agg?.itensVendidos || 0)} />
            <KpiCard label="% cancelamento" value={`${(agg?.cancelPct || 0).toFixed(1)}%`} />
            <KpiCard label="Tempo médio entrega" value={`${agg?.tempoMedioEntregaMin || 0} min`} />
          </section>

          {/* Heatmap + Top/Champion */}
          <section className="ana-grid main">
            <Heatmap matrix={agg?.heatmap?.matrix || []} max={agg?.heatmap?.max || 0} />
            <div className="ana-grid rightcol">
              <TopProducts items={agg?.topProducts || []} />
              <ChampionCard champion={agg?.champion} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
