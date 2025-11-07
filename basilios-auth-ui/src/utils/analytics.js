// src/utils/analytics.js

// util: parse ISO safely
function toDate(v) {
  try {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

// util: clamp
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

// date range check (inclusive)
function inRange(date, start, end) {
  if (!date) return false
  const t = date.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

// build a 7x24 matrix of zeros
function emptyHeat() {
  return Array.from({ length: 7 }, () => Array(24).fill(0))
}

export function aggregateFromMenu(menu, startDate, endDate) {
  // inputs: startDate/endDate in local time (Date objs)
  // outputs:
  // { receitaItens, pedidos, ticketMedio, itensVendidos, cancelPct, tempoMedioEntregaMin,
  //   heatmap: { matrix, max },
  //   topProducts: [{name, units}], champion: {name, units} }

  const ordersMap = new Map() // orderId -> { createdAt, confirmedAt, deliveredAt, status, cancelado }
  const topProductsMap = new Map() // productName -> units

  let receitaItens = 0
  let itensVendidos = 0

  // PASSO 1: varrer todos os productOrders dentro do range
  for (const prod of menu || []) {
    const productNameFallback = prod?.name || `#${prod?.id || '?'}`
    for (const po of prod?.productOrders || []) {
      const order = po?.order
      const createdAt = toDate(order?.createdAt)
      if (!createdAt || !inRange(createdAt, startDate, endDate)) continue

      // receita de itens
      const subtotal = Number(po?.subtotal ?? (po?.unitPrice || 0) * (po?.quantity || 0)) || 0
      receitaItens += subtotal

      // quantidade
      const q = Number(po?.quantity || 0) || 0
      itensVendidos += q

      // top products (usar productName do PO; se faltar, usar do product)
      const key = (po?.productName && String(po.productName).trim()) || productNameFallback
      topProductsMap.set(key, (topProductsMap.get(key) || 0) + q)

      // orders set (distinct)
      const oid = order?.id
      if (oid != null) {
        const confirmedAt = toDate(order?.confirmedAt)
        const deliveredAt = toDate(order?.deliveredAt)
        const statusText = String(order?.status || '').toLowerCase()
        const canceladoBool =
          Boolean(order?.cancelado) ||
          Boolean(order?.cancelledAt) ||
          statusText === 'cancelado'

        if (!ordersMap.has(oid)) {
          ordersMap.set(oid, {
            createdAt,
            confirmedAt,
            deliveredAt,
            status: statusText,
            cancelado: canceladoBool,
          })
        } else {
          // manter earliest confirmedAt / deliveredAt se aparecerem em outras linhas
          const ref = ordersMap.get(oid)
          ref.confirmedAt = ref.confirmedAt || confirmedAt
          ref.deliveredAt = ref.deliveredAt || deliveredAt
        }
      }
    }
  }

  // PASSO 2: KPIs de pedidos / cancelamentos / tempo médio entrega
  const pedidos = ordersMap.size
  const cancelados = Array.from(ordersMap.values()).filter((o) => o.cancelado).length
  const cancelPct = pedidos > 0 ? (cancelados / pedidos) * 100 : 0

  // tempo médio entrega (confirmado -> entregue)
  const tempos = []
  for (const o of ordersMap.values()) {
    if (o.confirmedAt && o.deliveredAt) {
      const diffMs = o.deliveredAt.getTime() - o.confirmedAt.getTime()
      if (diffMs > 0) tempos.push(diffMs)
    }
  }
  const tempoMedioEntregaMin =
    tempos.length > 0 ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length / 60000) : 0

  const ticketMedio = pedidos > 0 ? receitaItens / pedidos : 0

  // PASSO 3: heatmap por pedido (contar 1 por pedido)
  const heat = emptyHeat()
  let heatMax = 0
  for (const o of ordersMap.values()) {
    const d = o.createdAt
    if (!d) continue
    const dow = d.getDay() // 0 = dom
    const hr = d.getHours()
    heat[dow][hr] += 1
    if (heat[dow][hr] > heatMax) heatMax = heat[dow][hr]
  }

  // PASSO 4: Top produtos
  const topProducts = Array.from(topProductsMap.entries())
    .map(([name, units]) => ({ name, units }))
    .sort((a, b) => b.units - a.units)

  const champion = topProducts[0] || { name: '—', units: 0 }

  return {
    receitaItens,
    pedidos,
    ticketMedio,
    itensVendidos,
    cancelPct,
    tempoMedioEntregaMin,
    heatmap: { matrix: heat, max: heatMax },
    topProducts: topProducts.slice(0, 5),
    champion,
  }
}

// helpers de formatação
export function fmtCurrency(v) {
  try {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  } catch {
    return `R$ ${Number(v || 0).toFixed(2)}`
  }
}
export function fmtInt(n) {
  return Number(n || 0).toLocaleString('pt-BR')
}
