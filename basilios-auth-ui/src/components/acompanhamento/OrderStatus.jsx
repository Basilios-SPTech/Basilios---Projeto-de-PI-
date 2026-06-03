import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  XCircle,
  Loader,
  Clock,
} from "lucide-react";
import { http } from "../../services/http.js";
import { formatCurrency } from "../../utils/formatters.js";

const ORDER_ID_KEY = "lastOrderId";
const PIX_ORDER_ID_KEY = "pixOrderId";

const STATUS_STEPS = [
  {
    key: "PENDENTE",
    label: "Aguardando confirmação",
    description: "Recebemos seu pedido e aguardamos a confirmação da loja.",
    icon: Package,
  },
  {
    key: "CONFIRMADO",
    label: "Pedido confirmado",
    description: "Tudo certo! Seu pedido entrou na fila de preparo.",
    icon: CheckCircle,
  },
  {
    key: "PREPARANDO",
    label: "Em preparo",
    description: "Estamos preparando os seus itens com carinho.",
    icon: Clock,
  },
  {
    key: "DESPACHADO",
    label: "Saiu para entrega",
    description: "O entregador está a caminho do seu endereço.",
    icon: Truck,
  },
  {
    key: "ENTREGUE",
    label: "Entregue",
    description: "Pedido entregue. Bom apetite!",
    icon: MapPin,
  },
];

const STATUS_LABELS = {
  PENDENTE: "Aguardando confirmação",
  CONFIRMADO: "Pedido confirmado",
  PREPARANDO: "Em preparo",
  DESPACHADO: "Saiu para entrega",
  ENTREGUE: "Entregue",
};

function normalizeStatus(status) {
  if (!status) return "PENDENTE";

  const rawStatus = String(status).trim().toUpperCase();
  const normalized = rawStatus
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  if (["RECEBIDO", "PENDENTE"].includes(normalized)) return "PENDENTE";
  if (
    ["CONFIRMADO", "CONFIRMAÇÃO"].includes(rawStatus) ||
    ["CONFIRMADO", "CONFIRMACAO"].includes(normalized)
  ) {
    return "CONFIRMADO";
  }
  if (["EM_PREPARO", "PREPARANDO"].includes(normalized)) return "PREPARANDO";
  if (["SAIU_PARA_ENTREGA", "DESPACHADO"].includes(normalized)) {
    return "DESPACHADO";
  }
  if (normalized === "ENTREGUE") return "ENTREGUE";
  if (normalized === "CANCELADO") return "CANCELADO";

  return "PENDENTE";
}

function getItemTotal(item) {
  if (!item) return null;

  const quantity = Number(item.quantity ?? 1) || 1;
  const subtotal = item.subtotal ?? item.total;
  if (subtotal != null) {
    const parsed = Number(subtotal);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (item.price != null) {
    const parsed = Number(item.price);
    return Number.isFinite(parsed) ? parsed * quantity : null;
  }

  return null;
}

export default function OrderStatus() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = localStorage.getItem(ORDER_ID_KEY);
  const orderDate = order?.createdAt ? new Date(order.createdAt) : null;
  const items = Array.isArray(order?.items) ? order.items : [];
  const normalizedStatus = normalizeStatus(order?.status);
  const stepIndex = STATUS_STEPS.findIndex(
    (step) => step.key === normalizedStatus,
  );
  const currentStepIndex = stepIndex >= 0 ? stepIndex : 0;
  const statusLabel = STATUS_LABELS[normalizedStatus] || "Aguardando confirmação";
  const subtotalValue = Number(order?.subtotal ?? 0) || 0;
  const deliveryFeeValue = Number(order?.deliveryFee ?? 0) || 0;
  const discountValue = Number(order?.discount ?? 0) || 0;
  const totalValue =
    Number.isFinite(Number(order?.total)) && order?.total != null
      ? Number(order.total)
      : subtotalValue + deliveryFeeValue - discountValue;

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    } else {
      setError("ID do pedido não encontrado");
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      const response = await http.get(`/orders/me/${orderId}`);

      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar pedido:", err);
      if ([401, 403, 404].includes(Number(err?.status))) {
        try {
          localStorage.removeItem(ORDER_ID_KEY);
          localStorage.removeItem(PIX_ORDER_ID_KEY);
        } catch {
          // noop
        }
      }
      setError("Erro ao carregar dados do pedido");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
          <Loader
            size={48}
            className="sm:w-16 sm:h-16 mx-auto text-[#BB3530] mb-4 animate-spin"
          />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Carregando Pedido
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Aguarde um momento...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
          <XCircle
            size={48}
            className="sm:w-16 sm:h-16 mx-auto text-red-600 mb-4"
          />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Erro</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors touch-manipulation"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (order?.status === "CANCELADO") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
          <XCircle
            size={48}
            className="sm:w-16 sm:h-16 mx-auto text-red-600 mb-4"
          />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Pedido Cancelado
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Seu pedido #{order.id} foi cancelado com sucesso.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors touch-manipulation"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold mb-2">
                Acompanhe seu Pedido
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Pedido{" "}
                <span className="font-semibold text-gray-900">#{order.id}</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {orderDate
                  ? orderDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Data não disponível"}
              </p>
            </div>
          </div>
        </div>

        {/* Tempo Estimado */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FCEBEA] p-2 sm:p-3 rounded-full shrink-0">
              <Package size={20} className="sm:w-6 sm:h-6 text-[#BB3530]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg">
                Tempo Estimado de Entrega
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-[#BB3530]">
                30 - 40 minutos
              </p>
            </div>
          </div>
        </div>

        {/* Status do Pedido */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">
                Status do Pedido
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Status atual:{" "}
                <span className="font-semibold text-[#BB3530]">
                  {statusLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <ul className="space-y-5">
              {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const lineActive = index < currentStepIndex;

                return (
                  <li key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-[#BB3530] border-[#BB3530] text-white"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      {index !== STATUS_STEPS.length - 1 && (
                        <div
                          className={`mt-2 w-[2px] h-8 sm:h-10 ${
                            lineActive ? "bg-[#BB3530]" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm sm:text-base font-semibold ${
                            isActive ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] uppercase tracking-wide font-semibold text-[#BB3530] bg-[#FCEBEA] px-2 py-0.5 rounded-full">
                            Agora
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold text-sm sm:text-base text-gray-700 mb-3">
                Itens do Pedido
              </h3>
              {items.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {items.map((item, index) => {
                    const total = getItemTotal(item);
                    return (
                      <div
                        key={index}
                        className="py-3 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 break-words">
                            {item.quantity || 1}x{" "}
                            {item.productName || `Produto #${item.productId}`}
                          </p>
                          {item.observations && (
                            <p className="text-xs text-gray-500 mt-1 wrap-break-word">
                              Obs: {item.observations}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhum item encontrado no pedido.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detalhes do Pedido */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Detalhes do Pedido
          </h2>

          {/* Endereço de Entrega */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="font-semibold text-sm sm:text-base text-gray-700 mb-2 flex items-center gap-2">
              <MapPin
                size={16}
                className="sm:w-[18px] sm:h-[18px] shrink-0"
              />
              <span>Endereço de Entrega</span>
            </h3>
            <div className="ml-0 sm:ml-6 text-sm sm:text-base text-gray-600 space-y-1">
              <p>
                {order.address.rua}, {order.address.numero}
              </p>
              {order.address.complemento && <p>{order.address.complemento}</p>}
              <p>
                {order.address.bairro} - {order.address.cidade}/
                {order.address.estado}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                CEP: {order.address.cep}
              </p>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotalValue)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              <span>Taxa de entrega</span>
              <span>{formatCurrency(deliveryFeeValue)}</span>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-emerald-600">
                <span>Desconto</span>
                <span>- {formatCurrency(discountValue)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-[#BB3530]">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          {/* Observações */}
          {order.observations && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-sm sm:text-base text-gray-700 mb-2">
                Observações
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm wrap-break-word">
                {order.observations}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
