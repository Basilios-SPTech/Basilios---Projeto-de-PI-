// src/components/analytics/DateRangeBar.jsx
import React from 'react'

export function DateRangeBar({ start, end, onChange, onApply, loading }) {
  return (
    <div className="ana-toolbar">
      <div className="ana-field">
        <label>Início</label>
        <input
          type="date"
          value={start}
          onChange={(e) => onChange({ start: e.target.value, end })}
        />
      </div>
      <div className="ana-field">
        <label>Fim</label>
        <input
          type="date"
          value={end}
          onChange={(e) => onChange({ start, end: e.target.value })}
        />
      </div>
      <button className="ana-btn" onClick={onApply} disabled={loading}>
        {loading ? 'Carregando…' : 'Aplicar'}
      </button>
    </div>
  )
}
