import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  XCircle,
  Loader,
  CreditCard,
  ClipboardCheck,
  ChefHat,
  Bike,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

const STATUS_STEPS = [
  {
    key: "PAGAMENTO",
    label: "Pagamento Recebido",
    icon: CreditCard,
    description: "Pagamento confirmado",
  },
  {
    key: "PENDENTE",
    label: "Pedido Recebido",
    icon: ClipboardCheck,
    description: "Seu pedido foi recebido",
  },
  {
    key: "PREPARANDO",
    label: "Em Preparo",
    icon: ChefHat,
    description: "Estamos preparando tudo",
  },
  {
    key: "ENTREGUE",
    label: "Saiu para Entrega",
    icon: Bike,
    description: "A caminho de você",
  },
  {
    key: "FINALIZADO",
    label: "Entregue",
    icon: CheckCircle2,
    description: "Bom apetite!",
  },
];

const STATUS_INDEX_MAP = {
  PAGAMENTO: 0,
  PENDENTE: 1,
  PREPARANDO: 2,
  ENTREGUE: 3,
  FINALIZADO: 4,
};

export default function OrderStatus() {
  const [pedidoCancelado, setPedidoCancelado] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = localStorage.getItem("lastOrderId");

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
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(
        `http://localhost:8080/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar pedido:", err);
      setError("Erro ao carregar dados do pedido");
      setLoading(false);
    }
  };

  const handleCancelarPedido = () => {
    setMostrarConfirmacao(true);
  };

  const confirmarCancelamento = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8080/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setPedidoCancelado(true);
      setMostrarConfirmacao(false);
    } catch (err) {
      console.error("Erro ao cancelar pedido:", err);
      alert("Erro ao cancelar o pedido. Tente novamente.");
      setMostrarConfirmacao(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center shadow-lg">
          <Loader
            size={48}
            className="sm:w-16 sm:h-16 mx-auto text-blue-600 mb-4 animate-spin"
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

  if (pedidoCancelado || order?.status === "CANCELADO") {
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

  const currentIndex = STATUS_INDEX_MAP[order.status] ?? 1;

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
                {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Status do Pedido */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-6 text-gray-800">
            Status do Pedido
          </h2>

          {/* Desktop: horizontal */}
          <div className="hidden sm:flex items-start justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-orange-500 z-0 transition-all duration-700 ease-in-out"
              style={{
                width:
                  currentIndex === 0
                    ? "0%"
                    : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isDone = index < currentIndex;
              const isActive = index === currentIndex;
              const isPending = index > currentIndex;
              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center z-10 flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                      ${isDone ? "bg-orange-500 border-orange-500" : ""}
                      ${isActive ? "bg-white border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.15)]" : ""}
                      ${isPending ? "bg-white border-gray-200" : ""}
                    `}
                  >
                    <Icon
                      size={18}
                      className={`
                        ${isDone ? "text-white" : ""}
                        ${isActive ? "text-orange-500" : ""}
                        ${isPending ? "text-gray-300" : ""}
                      `}
                    />
                  </div>
                  <div className="mt-3 text-center px-1">
                    <p
                      className={`text-xs font-semibold leading-tight
                        ${isDone || isActive ? "text-gray-800" : "text-gray-400"}
                      `}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-orange-500 mt-0.5 font-medium">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: vertical */}
          <div className="flex flex-col sm:hidden gap-0">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isDone = index < currentIndex;
              const isActive = index === currentIndex;
              const isPending = index > currentIndex;
              const isLast = index === STATUS_STEPS.length - 1;
              return (
                <div key={step.key} className="flex items-stretch gap-3">
                  <div className="flex flex-col items-center w-10 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-500
                        ${isDone ? "bg-orange-500 border-orange-500" : ""}
                        ${isActive ? "bg-white border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.15)]" : ""}
                        ${isPending ? "bg-white border-gray-200" : ""}
                      `}
                    >
                      <Icon
                        size={18}
                        className={`
                          ${isDone ? "text-white" : ""}
                          ${isActive ? "text-orange-500" : ""}
                          ${isPending ? "text-gray-300" : ""}
                        `}
                      />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 my-1 ${isDone ? "bg-orange-500" : "bg-gray-200"}`}
                      />
                    )}
                  </div>
                  <div className="pb-4 flex flex-col justify-center">
                    <p
                      className={`text-sm font-semibold leading-tight
                        ${isDone || isActive ? "text-gray-800" : "text-gray-400"}
                      `}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-orange-500 mt-0.5 font-medium">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tempo Estimado */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <Package size={20} className="sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg">
                Tempo Estimado de Entrega
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                30 - 40 minutos
              </p>
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
                className="sm:w-[18px] sm:h-[18px] flex-shrink-0"
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

          {/* Itens do Pedido */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-sm sm:text-base text-gray-700 mb-3">
              Itens do Pedido
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-2 text-xs sm:text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-600 block">
                      {item.quantity}x {item.productName}
                    </span>
                    {item.observations && (
                      <p className="text-xs text-gray-500 mt-1 break-words">
                        Obs: {item.observations}
                      </p>
                    )}
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    R$ {item.total}
                  </span>
                </div>
              ))}
            </div>

            {/* Resumo Financeiro */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>Subtotal</span>
                <span>R$ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>Taxa de entrega</span>
                <span>R$ {order.deliveryFee.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600">
                  <span>Desconto</span>
                  <span>- R$ {order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-green-600">
                  R${" "}
                  {(
                    order.subtotal +
                    order.deliveryFee -
                    order.discount
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {order.observations && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-sm sm:text-base text-gray-700 mb-2">
                Observações
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm break-words">
                {order.observations}
              </p>
            </div>
          )}
        </div>

        {/* Botão Cancelar */}
        {/* {order.status !== "ENVIADO" &&
          order.status !== "ENTREGUE" &&
          order.status !== "CANCELADO" && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
              <button
                onClick={handleCancelarPedido}
                className="w-full cursor-pointer bg-red-600 hover:bg-red-700 active:bg-red-800 text-gray-50 py-3 rounded-lg font-semibold transition-colors touch-manipulation text-sm sm:text-base"
              >
                Cancelar Pedido
              </button>
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-3">
                Você pode cancelar o pedido antes dele sair para entrega
              </p>
            </div>
          )}*/}
      </div>

      {/* Modal de Confirmação */}
      {mostrarConfirmacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-5 sm:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              Confirmar Cancelamento
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
              Tem certeza que deseja cancelar o pedido #{order.id}? Esta ação
              não pode ser desfeita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setMostrarConfirmacao(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors touch-manipulation text-sm sm:text-base"
              >
                Voltar
              </button>
              <button
                onClick={confirmarCancelamento}
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors touch-manipulation text-sm sm:text-base"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
