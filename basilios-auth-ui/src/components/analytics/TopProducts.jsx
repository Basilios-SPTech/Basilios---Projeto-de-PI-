// src/components/analytics/TopProducts.jsx
import React, { useMemo } from 'react'
import { fmtInt } from '../../utils/analytics'

export function TopProducts({ items }) {
  const max = useMemo(() => items.reduce((m, it) => Math.max(m, it.units || 0), 0), [items])

  return (
    <div className="ana-card top-products-card">
      <div className="ana-card-title">Top 5 Produtos (Unidades)</div>
      <div className="bars">
        {items.map((it, idx) => {
          const w = max > 0 ? (it.units / max) * 100 : 0
          return (
            <div className="bar-row" key={it.name + idx}>
              <div className="bar-label" title={it.name}>{idx + 1}. {it.name}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${w}%` }} />
              </div>
              <div className="bar-value">{fmtInt(it.units)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
