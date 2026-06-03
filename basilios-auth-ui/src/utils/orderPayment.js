const CARD_METHODS = new Set(["CARTAO", "CARTAO_CREDITO", "CARTAO_DEBITO"]);

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

export function normalizePaymentMethod(value) {
  const token = normalizeToken(value);

  if (token === "PIX") return "PIX";
  if (token === "CARTAO_CREDITO") return "CARTAO_CREDITO";
  if (token === "CARTAO_DEBITO") return "CARTAO_DEBITO";
  if (token === "CARTAO") return "CARTAO";

  if (token.includes("CREDITO")) return "CARTAO_CREDITO";
  if (token.includes("DEBITO")) return "CARTAO_DEBITO";
  if (token.includes("CARTAO") || token.includes("CARD")) return "CARTAO";

  return "PIX";
}

export function normalizePaymentStatus(value) {
  const token = normalizeToken(value);

  if (token === "PAGO") return "PAGO";
  if (token === "PENDENTE") return "PENDENTE";
  if (token === "CARTAO") return "CARTAO";

  if (token.includes("PAG")) return "PAGO";
  if (token.includes("PEND")) return "PENDENTE";
  if (token.includes("CARTAO") || token.includes("CARD")) return "CARTAO";

  return "";
}

export function getPaymentStatusPresentation(order) {
  const method = normalizePaymentMethod(order?.metodoPagamento);
  const status = normalizePaymentStatus(order?.statusPagamento);

  if (method === "PIX") {
    if (status === "PAGO") {
      return {
        method,
        status,
        text: "Pago",
        description: "PIX",
        tone: "paid",
      };
    }

    return {
      method,
      status: status || "PENDENTE",
      text: "Aguardando pagamento",
      description: "PIX",
      tone: "pending",
    };
  }

  if (CARD_METHODS.has(method)) {
    return {
      method,
      status: status || "CARTAO",
      text: "Pagamento em cartao",
      description: "Cartao",
      tone: "card",
    };
  }

  return {
    method,
    status,
    text: "Pagamento",
    description: method || "Nao informado",
    tone: "neutral",
  };
}
