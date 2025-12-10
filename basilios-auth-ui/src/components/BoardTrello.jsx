import React, { useState, useEffect } from "react";
import { GripVertical, MapPin, Package, Clock, RefreshCw } from "lucide-react";
import axios from "axios";

export default function BoardPedidos() {
  const [columns, setColumns] = useState({
    PENDENTE: {
      id: "PENDENTE",
      title: "Recebidos",
      color: "blue",
      tasks: [],
    },
    PREPARANDO: {
      id: "PREPARANDO",
      title: "Em preparação",
      color: "yellow",
      tasks: [],
    },
    ENTREGUE: {
      id: "ENTREGUE",
      title: "Saiu para entrega",
      color: "green",
      tasks: [],
    },
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:8080/orders?size=50", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar pedidos");
      }

      const data = await response.json();
      const orders = data.content;
      console.log(orders);

      const newColumns = {
        PENDENTE: { ...columns.PENDENTE, tasks: [] },
        PREPARANDO: { ...columns.PREPARANDO, tasks: [] },
        ENTREGUE: { ...columns.ENTREGUE, tasks: [] },
      };

      orders.forEach((order) => {
        const task = {
          id: order.id,
          orderId: order.id,
          items: order.items,
          address: order.address,
          createdAt: new Date(order.createdAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          discount: order.discount,
          total: order.total,
          observations: order.observations,
          totalItems: order.totalItems,
        };

        if (newColumns[order.status]) {
          newColumns[order.status].tasks.push(task);
        }
      });

      setColumns(newColumns);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Erro ao carregar pedidos. Verifique sua conexão.");
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      green: {
        border: "border-green-500",
        bg: "bg-green-50",
        badge: "bg-green-500",
        hover: "hover:border-green-600",
      },
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-50",
        badge: "bg-blue-500",
        hover: "hover:border-blue-600",
      },
      yellow: {
        border: "border-yellow-500",
        bg: "bg-yellow-50",
        badge: "bg-yellow-500",
        hover: "hover:border-yellow-600",
      },
    };
    return colors[color];
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask(task);
    setDraggedFrom(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();

    if (!draggedTask || !draggedFrom) return;

    if (draggedFrom === targetColumnId) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    // Pegar o ID do pedido
    const orderId = draggedTask.id;
    console.log(
      "Atualizando pedido ID:",
      orderId,
      "para status:",
      targetColumnId,
    );

    try {
      const token = localStorage.getItem("auth_token");
      let body = {
        status: targetColumnId,
      };
      const response = await axios.patch(
        `http://localhost:8080/orders/${orderId}/status`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log(response);

      // Atualizar o estado local após sucesso na API
      setColumns((prev) => {
        const newColumns = { ...prev };

        newColumns[draggedFrom] = {
          ...newColumns[draggedFrom],
          tasks: newColumns[draggedFrom].tasks.filter(
            (t) => t.id !== draggedTask.id,
          ),
        };

        newColumns[targetColumnId] = {
          ...newColumns[targetColumnId],
          tasks: [...newColumns[targetColumnId].tasks, draggedTask],
        };

        return newColumns;
      });

      setDraggedTask(null);
      setDraggedFrom(null);
    } catch (err) {
      console.error("Erro ao atualizar status do pedido:", err);
      alert(`Erro ao atualizar o status do pedido #${orderId}`);
      setDraggedTask(null);
      setDraggedFrom(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Painel de Pedidos - Basílios
            </h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.values(columns).map((column) => {
            const colorClasses = getColorClasses(column.color);
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-96 ${colorClasses.bg} rounded-xl p-4 border-2 ${colorClasses.border}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {column.title}
                    <span
                      className={`text-xs ${colorClasses.badge} text-white px-2.5 py-1 rounded-full font-semibold`}
                    >
                      {column.tasks.length}
                    </span>
                  </h2>
                </div>

                <div className="space-y-3 min-h-[500px]">
                  {column.tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum pedido</p>
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task, column.id)}
                        className={`bg-white rounded-xl border-2 border-gray-200 cursor-move ${colorClasses.hover} hover:shadow-lg transition-all duration-200`}
                      >
                        {/* Header do Card */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                              <h3 className="text-lg font-bold text-gray-900">
                                Pedido #{task.orderId}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-semibold">
                                {task.createdAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Itens do Pedido */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-gray-600" />
                            <h4 className="text-sm font-semibold text-gray-700">
                              Itens ({task.totalItems})
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {task.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-start text-sm"
                              >
                                <div className="flex-1">
                                  <p className="text-gray-900 font-medium">
                                    {item.quantity}x {item.productName}
                                  </p>
                                  {item.observations && (
                                    <p className="text-gray-500 text-xs mt-1">
                                      Obs: {item.observations}
                                    </p>
                                  )}
                                  {item.hadPromotion && (
                                    <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                      {item.promotionName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-gray-900 font-semibold">
                                    R$ {item.subtotal.toFixed(2)}
                                  </p>
                                  {item.hadPromotion && item.originalPrice && (
                                    <p className="text-gray-400 text-xs line-through">
                                      R$ {item.originalPrice.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Endereço de Entrega */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                Endereço de Entrega
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {task.address.rua}, {task.address.numero}
                                {task.address.complemento &&
                                  `, ${task.address.complemento}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {task.address.bairro} - {task.address.cidade}/
                                {task.address.estado}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                CEP: {task.address.cep}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Observações (se houver) */}
                        {task.observations && (
                          <div className="p-4 border-b border-gray-100 bg-yellow-50">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">
                                Obs do cliente:
                              </span>{" "}
                              {task.observations}
                            </p>
                          </div>
                        )}

                        {/* Totais */}
                        <div className="p-4 bg-gray-50 rounded-b-xl">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-gray-600">
                              <span>Subtotal</span>
                              <span>R$ {task.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Taxa de entrega</span>
                              <span>R$ {task.deliveryFee.toFixed(2)}</span>
                            </div>
                            {task.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Desconto</span>
                                <span>- R$ {task.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                              <span>Total</span>
                              <span className="text-green-600">
                                R$ {task.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
