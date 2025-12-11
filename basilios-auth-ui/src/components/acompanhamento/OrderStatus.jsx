import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  XCircle,
  Loader,
} from "lucide-react";
import axios from "axios";

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
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <Loader
            size={64}
            className="mx-auto text-blue-600 mb-4 animate-spin"
          />
          <h2 className="text-2xl font-bold mb-2">Carregando Pedido</h2>
          <p className="text-gray-600">Aguarde um momento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <XCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
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
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <XCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pedido Cancelado</h2>
          <p className="text-gray-600 mb-6">
            Seu pedido #{order.id} foi cancelado com sucesso.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Acompanhe seu Pedido</h1>
              <p className="text-gray-600">
                Pedido{" "}
                <span className="font-semibold text-gray-900">#{order.id}</span>
              </p>
              <p className="text-sm text-gray-500">
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

        {/* Tempo Estimado */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                Tempo Estimado de Entrega
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                30 - 40 minutos
              </p>
            </div>
          </div>
        </div>

        {/* Detalhes do Pedido */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Detalhes do Pedido</h2>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={18} />
              Endereço de Entrega
            </h3>
            <div className="ml-6 text-gray-600">
              <p>
                {order.address.rua}, {order.address.numero}
              </p>
              {order.address.complemento && <p>{order.address.complemento}</p>}
              <p>
                {order.address.bairro} - {order.address.cidade}/
                {order.address.estado}
              </p>
              <p className="text-sm text-gray-500">CEP: {order.address.cep}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              Itens do Pedido
            </h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-gray-600">
                      {item.quantity}x {item.productName}
                    </span>
                    {item.observations && (
                      <p className="text-xs text-gray-500 ml-4">
                        Obs: {item.observations}
                      </p>
                    )}
                  </div>
                  <span className="font-medium">
                    R$ {item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>R$ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxa de entrega</span>
                <span>R$ {order.deliveryFee.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>- R$ {order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-green-600">
                  R$ {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {order.observations && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Observações</h3>
              <p className="text-gray-600 text-sm">{order.observations}</p>
            </div>
          )}
        </div>

        {/* Botão Cancelar */}
        {/* {order.status !== "ENVIADO" &&
          order.status !== "ENTREGUE" &&
          order.status !== "CANCELADO" && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <button
                onClick={handleCancelarPedido}
                className="w-full cursor-pointer bg-red-600 hover:bg-red-700 text-gray-50 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar Pedido
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                Você pode cancelar o pedido antes dele sair para entrega
              </p>
            </div>
          )}*/}
      </div>

      {mostrarConfirmacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar Cancelamento</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar o pedido #{order.id}? Esta ação
              não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirmacao(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={confirmarCancelamento}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
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
