// src/components/analytics/ChampionCard.jsx
import React from 'react'
import { fmtInt } from '../../utils/analytics'

export function ChampionCard({ champion }) {
  return (
    <div className="ana-card champion-card">
      <div className="ana-card-title">Campeão do Período</div>
      <div className="champion-name">{champion?.name || '—'}</div>
      <div className="champion-units">{fmtInt(champion?.units || 0)} un.</div>
    </div>
  )
}
