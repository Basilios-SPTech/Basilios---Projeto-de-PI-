// src/components/analytics/KpiCard.jsx
import React from 'react'

export function KpiCard({ label, value, sublabel }) {
  return (
    <div className="ana-card kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sublabel ? <div className="kpi-sublabel">{sublabel}</div> : null}
    </div>
  )
}
