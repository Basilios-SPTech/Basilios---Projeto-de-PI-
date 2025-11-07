// src/components/analytics/Heatmap.jsx
import React, { useMemo } from 'react'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function Heatmap({ matrix, max }) {
  const scaled = useMemo(() => {
    const m = max || 1
    return (matrix || []).map((row) =>
      row.map((v) => {
        const pct = m > 0 ? v / m : 0
        const clamped = Math.max(0, Math.min(1, pct))
        // intensidade: 8%..100% (evitar blocos invisíveis)
        return 0.08 + clamped * 0.92
      })
    )
  }, [matrix, max])

  return (
    <div className="ana-card heatmap-card">
      <div className="ana-card-title">Picos de Pedidos (Hora × Dia)</div>
      <div className="heatmap-grid">
        <div className="heatmap-corner" />
        <div className="heatmap-hours">
          {HOURS.map((h) => (
            <div key={h} className="heatmap-hour">{String(h).padStart(2, '0')}h</div>
          ))}
        </div>
        <div className="heatmap-rows">
          {scaled.map((row, i) => (
            <div className="heatmap-row" key={i}>
              <div className="heatmap-day">{DAYS[i]}</div>
              {row.map((strength, j) => (
                <div
                  key={j}
                  className="heatmap-cell"
                  style={{ background: `rgba(187,53,48,${strength})` }} // #BB3530
                  title={`${DAYS[i]} • ${String(j).padStart(2, '0')}h`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span>Baixo</span><div className="legend-bar"/><span>Alto</span>
      </div>
    </div>
  )
}
