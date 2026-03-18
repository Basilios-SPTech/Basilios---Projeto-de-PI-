import { useState, useEffect, useRef, useCallback } from "react";
import { GripVertical, MapPin, Package, Clock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { http } from "../services/http.js";

const BOARD_COLUMNS = {
  PENDENTE: {
    id: "PENDENTE",
    title: "Recebidos",
    color: "pending",
  },
  PREPARANDO: {
    id: "PREPARANDO",
    title: "Em preparação",
    color: "preparing",
  },
  DESPACHADO: {
    id: "DESPACHADO",
    title: "Saiu para entrega",
    color: "dispatch",
  },
  ENTREGUE: {
    id: "ENTREGUE",
    title: "Entregue",
    color: "delivered",
  },
  CANCELADO: {
    id: "CANCELADO",
    title: "Cancelado",
    color: "cancelled",
  },
};

function createColumns() {
  return Object.fromEntries(
    Object.entries(BOARD_COLUMNS).map(([key, column]) => [
      key,
      { ...column, tasks: [] },
    ]),
  );
}

function normalizeBoardStatus(status) {
  if (!status) return "PENDENTE";

  const normalized = String(status)
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["RECEBIDO", "PENDENTE", "CONFIRMADO"].includes(normalized)) {
    return "PENDENTE";
  }

  if (["EM_PREPARO", "PREPARANDO"].includes(normalized)) {
    return "PREPARANDO";
  }

  if (["SAIU_PARA_ENTREGA", "DESPACHADO"].includes(normalized)) {
    return "DESPACHADO";
  }

  if (normalized === "ENTREGUE") return "ENTREGUE";
  if (normalized === "CANCELADO") return "CANCELADO";

  return "PENDENTE";
}

function mapBoardStatusToApi(status) {
  if (status === "PREPARANDO") return "EM_PREPARO";
  if (status === "DESPACHADO") return "SAIU_PARA_ENTREGA";

  return status;
}

export default function BoardPedidos() {
  const [columns, setColumns] = useState(createColumns);

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const dragOverColumnRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAddresses, setExpandedAddresses] = useState({});

  // ─── Touch Drag-and-Drop ───
  const touchState = useRef({
    task: null,
    fromColumn: null,
    ghost: null,
    startX: 0,
    startY: 0,
    longPressTimer: null,
  });
  const boardColumnsRef = useRef(null);
  const fingerPos = useRef({ x: 0, y: 0 });
  const scrollLoopRef = useRef(null);

  const cleanupTouch = useCallback(() => {
    const ts = touchState.current;
    if (ts.ghost && ts.ghost.parentNode) {
      ts.ghost.parentNode.removeChild(ts.ghost);
    }
    if (ts.longPressTimer) clearTimeout(ts.longPressTimer);
    if (scrollLoopRef.current) cancelAnimationFrame(scrollLoopRef.current);
    scrollLoopRef.current = null;
    // Reativa snap scroll
    if (boardColumnsRef.current) {
      boardColumnsRef.current.style.scrollSnapType = '';
    }
    // Remove listeners nativos
    document.removeEventListener("touchmove", touchMoveHandler.current, { passive: false });
    document.removeEventListener("touchend", touchEndHandler.current);
    document.removeEventListener("touchcancel", touchEndHandler.current);
    ts.task = null;
    ts.fromColumn = null;
    ts.ghost = null;
    ts.longPressTimer = null;
    dragOverColumnRef.current = null;
    setDragOverColumn(null);
  }, []);

  // Handlers nativos armazenados em refs para poder remover depois
  const touchMoveHandler = useRef(null);
  const touchEndHandler = useRef(null);

  // Loop contínuo de auto-scroll — lê fingerPos.current a cada frame
  const startScrollLoop = useCallback(() => {
    const tick = () => {
      const c = boardColumnsRef.current;
      if (!c || !touchState.current.ghost) return;

      const maxScroll = c.scrollWidth - c.clientWidth;
      if (maxScroll <= 0) {
        scrollLoopRef.current = requestAnimationFrame(tick);
        return;
      }

      const r = c.getBoundingClientRect();
      const fx = fingerPos.current.x;
      const containerWidth = r.width;

      // Percentual da posição do dedo dentro do viewport do container
      // 0 = borda esquerda, 1 = borda direita
      // Pode ser < 0 ou > 1 se o dedo está fora do container
      const pctInView = containerWidth > 0 ? (fx - r.left) / containerWidth : 0.5;

      const edgePct = 0.18; // 18% de cada borda é "zona de scroll"
      const baseSpeed = 4;
      const maxSpeed = 22;

      if (pctInView > 1 - edgePct) {
        const over = Math.min(1, (pctInView - (1 - edgePct)) / edgePct);
        c.scrollLeft = Math.min(maxScroll, c.scrollLeft + baseSpeed + over * maxSpeed);
      } else if (pctInView < edgePct) {
        const over = Math.min(1, (edgePct - pctInView) / edgePct);
        c.scrollLeft = Math.max(0, c.scrollLeft - baseSpeed - over * maxSpeed);
      }

      scrollLoopRef.current = requestAnimationFrame(tick);
    };
    scrollLoopRef.current = requestAnimationFrame(tick);
  }, []);

  const handleTouchStart = useCallback((e, task, columnId) => {
    const touch = e.touches[0];
    const ts = touchState.current;
    ts.startX = touch.clientX;
    ts.startY = touch.clientY;
    ts.task = task;
    ts.fromColumn = columnId;

    // Inicializa fingerPos com a posição do toque para o auto-scroll
    fingerPos.current.x = touch.clientX;
    fingerPos.current.y = touch.clientY;

    // Captura referência ao card ANTES do timeout
    const card = e.currentTarget;

    // Long-press de 250ms para iniciar drag
    ts.longPressTimer = setTimeout(() => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const ghost = card.cloneNode(true);
      ghost.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: auto;
        max-height: 120px;
        overflow: hidden;
        opacity: 0.9;
        transform: rotate(2deg) scale(1.04);
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        border-radius: 12px;
        transition: none;
      `;
      document.body.appendChild(ghost);
      ts.ghost = ghost;

      // Desabilita snap para permitir scroll programático durante drag
      if (boardColumnsRef.current) {
        boardColumnsRef.current.style.scrollSnapType = 'none';
      }

      // Inicia o loop contínuo de auto-scroll
      startScrollLoop();

      // Registra listeners nativos com { passive: false } para poder preventDefault
      document.addEventListener("touchmove", touchMoveHandler.current, { passive: false });
      document.addEventListener("touchend", touchEndHandler.current);
      document.addEventListener("touchcancel", touchEndHandler.current);
    }, 250);

    // Define o move handler (precisa existir antes do setTimeout ativar)
    touchMoveHandler.current = (ev) => {
      const t = touchState.current;
      if (!t.task) return;

      const tc = ev.touches[0];
      const dx = Math.abs(tc.clientX - t.startX);
      const dy = Math.abs(tc.clientY - t.startY);

      // Se moveu antes do ghost existir, cancela (era scroll)
      if (!t.ghost) {
        if (dx > 10 || dy > 10) {
          if (t.longPressTimer) {
            clearTimeout(t.longPressTimer);
            t.longPressTimer = null;
          }
          t.task = null;
          t.fromColumn = null;
        }
        return;
      }

      ev.preventDefault();

      // Clamp dentro da viewport (clientX pode ficar negativo no DevTools mobile)
      const x = Math.max(0, Math.min(window.innerWidth, tc.clientX));
      const y = Math.max(0, Math.min(window.innerHeight, tc.clientY));

      fingerPos.current.x = x;
      fingerPos.current.y = y;

      t.ghost.style.left = `${x - 60}px`;
      t.ghost.style.top = `${y - 40}px`;

      t.ghost.style.display = "none";
      const elementBelow = document.elementFromPoint(x, y);
      t.ghost.style.display = "";

      if (elementBelow) {
        const col = elementBelow.closest("[data-column-id]");
        if (col) {
          dragOverColumnRef.current = col.dataset.columnId;
          setDragOverColumn(col.dataset.columnId);
        } else {
          dragOverColumnRef.current = null;
          setDragOverColumn(null);
        }
      }
    };

    // Define o end handler
    touchEndHandler.current = () => {
      const t = touchState.current;
      if (t.longPressTimer) clearTimeout(t.longPressTimer);

      if (!t.ghost || !t.task) {
        cleanupTouch();
        return;
      }

      const targetCol = dragOverColumnRef.current;
      const droppedTask = t.task;
      const fromCol = t.fromColumn;

      cleanupTouch();

      if (targetCol && targetCol !== fromCol) {
        handleDrop(
          { preventDefault: () => {} },
          targetCol,
          droppedTask,
          fromCol,
        );
      }
    };
  }, [cleanupTouch]);

  const toggleAddress = (taskId) => {
    setExpandedAddresses((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/orders", { params: { size: 50 } });

      const orders = Array.isArray(data) ? data : (data?.content ?? []);

      const newColumns = createColumns();

      orders.forEach((order) => {
        const normalizedStatus = normalizeBoardStatus(order.status);
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

        if (newColumns[normalizedStatus]) {
          newColumns[normalizedStatus].tasks.push(task);
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
      pending: {
        border: "border-blue-500",
        bg: "bg-blue-50",
        badge: "bg-blue-500",
        hover: "hover:border-blue-600",
        dropzone: "bg-blue-100 border-blue-500",
        headerAccent: "text-blue-600",
      },
      preparing: {
        border: "border-yellow-500",
        bg: "bg-yellow-50",
        badge: "bg-yellow-500",
        hover: "hover:border-yellow-600",
        dropzone: "bg-yellow-100 border-yellow-500",
        headerAccent: "text-yellow-600",
      },
      delivered: {
        border: "border-green-500",
        bg: "bg-green-50",
        badge: "bg-green-500",
        hover: "hover:border-green-600",
        dropzone: "bg-green-100 border-green-500",
        headerAccent: "text-green-600",
      },
      dispatch: {
        border: "border-cyan-500",
        bg: "bg-cyan-50",
        badge: "bg-cyan-500",
        hover: "hover:border-cyan-600",
        dropzone: "bg-cyan-100 border-cyan-500",
        headerAccent: "text-cyan-600",
      },
      cancelled: {
        border: "border-rose-500",
        bg: "bg-rose-50",
        badge: "bg-rose-500",
        hover: "hover:border-rose-600",
        dropzone: "bg-rose-100 border-rose-500",
        headerAccent: "text-rose-600",
      },
    };
    return colors[color];
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask(task);
    setDraggedFrom(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnId) setDragOverColumn(columnId);
  };

  const handleDragLeave = (e, columnId) => {
    // Só limpa se realmente saiu da coluna (não entrou em um filho)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetColumnId, touchTask, touchFrom) => {
    e.preventDefault();
    setDragOverColumn(null);

    const task = touchTask || draggedTask;
    const from = touchFrom || draggedFrom;

    if (!task || !from) return;

    if (from === targetColumnId) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    const orderId = task.id;
    console.log(
      "Atualizando pedido ID:",
      orderId,
      "para status:",
      targetColumnId,
    );

    try {
      const body = { status: mapBoardStatusToApi(targetColumnId) };
      await http.patch(`/orders/${orderId}/status`, body);

      setColumns((prev) => {
        const newColumns = { ...prev };

        newColumns[from] = {
          ...newColumns[from],
          tasks: newColumns[from].tasks.filter(
            (t) => t.id !== task.id,
          ),
        };

        newColumns[targetColumnId] = {
          ...newColumns[targetColumnId],
          tasks: [...newColumns[targetColumnId].tasks, task],
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
      <div className="board-root min-h-screen w-full bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-neutral-300 border-t-red-700 mx-auto mb-4"></div>
          <p className="text-neutral-600 text-base font-medium">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-root min-h-screen w-full bg-neutral-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 max-w-sm mx-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-red-700" />
          </div>
          <p className="text-red-700 text-base font-semibold mb-2">Falha ao carregar</p>
          <p className="text-neutral-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="board-root min-h-screen w-full bg-neutral-100 px-4 md:px-6 lg:px-8 pb-8 pt-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Painel de Pedidos
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
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
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-sm font-semibold self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* Colunas */}
        <div
          ref={boardColumnsRef}
          className="board-columns flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 2xl:grid 2xl:grid-cols-5 2xl:overflow-visible 2xl:snap-none 2xl:pb-0 scrollbar-hide"
        >
          {Object.values(columns).map((column) => {
            const colorClasses = getColorClasses(column.color);
            const isDragOver = dragOverColumn === column.id && draggedFrom !== column.id;
            return (
              <div
                key={column.id}
                data-column-id={column.id}
                className={`min-w-[80vw] 2xl:min-w-0 snap-start shrink-0 2xl:shrink rounded-xl p-4 border-2 transition-all duration-200 ${
                  isDragOver
                    ? `${colorClasses.dropzone} border-dashed scale-[1.01]`
                    : `${colorClasses.bg} ${colorClasses.border}`
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={(e) => handleDragLeave(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Header da coluna */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                    {column.title}
                    <span
                      className={`text-xs ${colorClasses.badge} text-white px-2 py-0.5 rounded-full font-semibold`}
                    >
                      {column.tasks.length}
                    </span>
                  </h2>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[200px]">
                  {column.tasks.length === 0 ? (
                    <div className={`text-center py-10 rounded-lg border-2 border-dashed transition-colors ${
                      isDragOver ? "border-transparent" : "border-neutral-200"
                    }`}>
                      <Package className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                      <p className="text-sm text-neutral-400">Nenhum pedido</p>
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task, column.id)}
                        onTouchStart={(e) => handleTouchStart(e, task, column.id)}
                        className={`bg-white rounded-xl border border-neutral-200 cursor-grab active:cursor-grabbing ${colorClasses.hover} hover:shadow-md transition-all duration-200 active:shadow-lg active:scale-[1.02] touch-none md:touch-auto`}
                      >
                        {/* Header do Card */}
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-neutral-300" />
                              <h3 className={`text-base font-bold ${colorClasses.headerAccent}`}>
                                #{task.orderId}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 text-neutral-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-xs font-semibold">
                                {task.createdAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Itens do Pedido */}
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Package className="w-3.5 h-3.5 text-neutral-400" />
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                              Itens ({task.totalItems})
                            </h4>
                          </div>
                          <div className="space-y-1.5">
                            {task.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-start text-sm"
                              >
                                <div className="flex-1">
                                  <p className="text-neutral-800 font-medium text-sm">
                                    {item.quantity}× {item.productName}
                                  </p>
                                  {item.observations && (
                                    <p className="text-neutral-400 text-xs mt-0.5 italic">
                                      {item.observations}
                                    </p>
                                  )}
                                  {item.hadPromotion && (
                                    <span className="inline-block mt-1 text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium">
                                      {item.promotionName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-neutral-800 font-semibold text-sm">
                                    R$ {item.subtotal.toFixed(2)}
                                  </p>
                                  {item.hadPromotion && item.originalPrice && (
                                    <p className="text-neutral-400 text-xs line-through">
                                      R$ {item.originalPrice.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Endereço de Entrega — Colapsável */}
                        <div className="border-b border-neutral-100">
                          <button
                            type="button"
                            onClick={() => toggleAddress(task.id)}
                            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                Entrega
                              </span>
                            </div>
                            {expandedAddresses[task.id] ? (
                              <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </button>
                          {expandedAddresses[task.id] && (
                            <div className="px-4 pb-3 text-sm text-neutral-600 leading-relaxed">
                              <p>
                                {task.address.rua}, {task.address.numero}
                                {task.address.complemento &&
                                  ` — ${task.address.complemento}`}
                              </p>
                              <p>
                                {task.address.bairro} · {task.address.cidade}/{task.address.estado}
                              </p>
                              <p className="text-xs text-neutral-400 mt-1">
                                CEP {task.address.cep}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Observações (se houver) */}
                        {task.observations && (
                          <div className="px-4 py-2.5 border-b border-neutral-100 bg-amber-50/60">
                            <p className="text-xs text-neutral-600">
                              <span className="font-semibold">Obs:</span>{" "}
                              {task.observations}
                            </p>
                          </div>
                        )}

                        {/* Total */}
                        <div className="px-4 py-3 bg-neutral-50 rounded-b-xl">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-neutral-400 text-xs">
                              <span>Subtotal</span>
                              <span>R$ {task.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-400 text-xs">
                              <span>Entrega</span>
                              <span>R$ {task.deliveryFee.toFixed(2)}</span>
                            </div>
                            {task.discount > 0 && (
                              <div className="flex justify-between text-emerald-600 text-xs">
                                <span>Desconto</span>
                                <span>− R$ {task.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                              <span>Total</span>
                              <span>
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
