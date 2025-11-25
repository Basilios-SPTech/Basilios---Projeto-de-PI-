import { useState } from "react";
import { Package, CheckCircle, Truck, MapPin, XCircle } from "lucide-react";

import OrderTime from "./OrderTime";

export default function OrderStatus() {
  const [pedidoCancelado, setPedidoCancelado] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // Dados mockados do pedido
  const order = {
    id: "#12345678",
    status: "em_preparo",
    tempoEstimado: "30-40 minutos",
    dataPedido: "25/11/2025 - 14:30",
    endereco: "Rua X, N 123",
    itens: [
      { nome: "Produto A", quantidade: 2, preco: 59.9 },
      { nome: "Produto B", quantidade: 1, preco: 129.9 },
      { nome: "Produto C", quantidade: 3, preco: 39.9 },
    ],
    total: 369.4,
  };

  const etapas = [
    {
      id: 1,
      titulo: "Pedido Confirmado",
      descricao: "Seu pedido foi recebido",
      concluido: true,
      icon: CheckCircle,
    },
    {
      id: 2,
      titulo: "Em Preparação",
      descricao: "Estamos preparando seu pedido",
      concluido: true,
      icon: Package,
    },
    {
      id: 3,
      titulo: "Saiu para Entrega",
      descricao: "Seu pedido está a caminho",
      concluido: false,
      icon: Truck,
    },
    {
      id: 4,
      titulo: "Entregue",
      descricao: "Pedido entregue com sucesso",
      concluido: false,
      icon: MapPin,
    },
  ];

  const handleCancelarPedido = () => {
    setMostrarConfirmacao(true);
  };

  const confirmarCancelamento = () => {
    setPedidoCancelado(true);
    setMostrarConfirmacao(false);

    // request pro banco pra cancelar o pedido
  };

  if (pedidoCancelado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <XCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pedido Cancelado</h2>
          <p className="text-gray-600 mb-6">
            Seu pedido {pedido.id} foi cancelado com sucesso.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

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
                <span className="font-semibold text-gray-900">{order.id}</span>
              </p>
              <p className="text-sm text-gray-500">{order.dataPedido}</p>
            </div>
          </div>
        </div>

        {/* Tempo Estimado */}
        <OrderTime tempoEstimado={order.tempoEstimado} />

        {/* Detalhes do Pedido */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Detalhes do Pedido</h2>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={18} />
              Endereço de Entrega
            </h3>
            <p className="text-gray-600 ml-6">{order.endereco}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              Itens do Pedido
            </h3>
            <div className="space-y-2">
              {order.itens.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantidade}x {item.nome}
                  </span>
                  <span className="font-medium">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Cancelar */}
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
      </div>

      {mostrarConfirmacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar Cancelamento</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar o pedido {order.id}? Esta ação não
              pode ser desfeita.
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
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
