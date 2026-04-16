import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  PlusCircle,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import MenuButtonAuto from "../components/MenuButtonAuto.jsx";
import { http } from "../services/http.js";
import { formatCurrency } from "../utils/formatters.js";

const CHAVE_CART = "carrinho-basilios";

const STATUS_LABELS = {
  PENDENTE: "Recebido",
  CONFIRMADO: "Confirmado",
  PREPARANDO: "Em preparação",
  DESPACHADO: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_STYLES = {
  PENDENTE: "bg-sky-100 text-sky-700 border-sky-300",
  CONFIRMADO: "bg-blue-100 text-blue-700 border-blue-300",
  PREPARANDO: "bg-amber-100 text-amber-800 border-amber-300",
  DESPACHADO: "bg-emerald-100 text-emerald-700 border-emerald-300",
  ENTREGUE: "bg-emerald-100 text-emerald-700 border-emerald-300",
  CANCELADO: "bg-rose-100 text-rose-700 border-rose-300",
};

const STATUS_ICON_STYLES = {
  PENDENTE: "text-sky-700",
  CONFIRMADO: "text-blue-700",
  PREPARANDO: "text-amber-700",
  DESPACHADO: "text-emerald-700",
  ENTREGUE: "text-emerald-700",
  CANCELADO: "text-rose-700",
};

function StatusIcon({ status, size = 14 }) {
  if (status === "PENDENTE") return <Clock3 size={size} />;
  if (status === "CONFIRMADO") return <CheckCircle2 size={size} />;
  if (status === "DESPACHADO") return <Truck size={size} />;
  if (status === "ENTREGUE") return <CheckCircle2 size={size} />;
  if (status === "CANCELADO") return <XCircle size={size} />;
  return <Package size={size} />;
}

function normalizeStatus(status) {
  if (!status) return "PENDENTE";

  const normalized = String(status)
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["RECEBIDO", "PENDENTE"].includes(normalized)) {
    return "PENDENTE";
  }

  if (
    normalized === "CONFIRMADO" ||
    normalized.includes("CONFIRM") ||
    normalized.includes("APROV") ||
    normalized.includes("ACEIT")
  ) {
    return "CONFIRMADO";
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

function normalizeOrdersPayload(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.orders)) return data.orders;

  if (data && typeof data === "object" && Array.isArray(data.items)) {
    return [data];
  }

  return [];
}

function formatOrderDate(dateValue) {
  if (!dateValue) return "Data indisponivel";
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) return "Data indisponivel";

  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAddressLabel(order) {
  if (order?.address?.enderecoCompleto) return order.address.enderecoCompleto;

  if (!order?.address) return "Endereco nao informado";

  const parts = [
    order.address.rua,
    order.address.numero,
    order.address.complemento,
    order.address.bairro,
    order.address.cidade,
    order.address.estado,
  ]
    .filter(Boolean)
    .join(", ");

  return parts || "Endereco nao informado";
}

function parseItemAdditions(item) {
  if (!item || typeof item !== "object") return [];

  const grouped = {};

  const addEntry = (rawName, rawQty = 1) => {
    const safeName = String(rawName || "").trim();
    const safeQty = Number(rawQty);

    if (!safeName) return;
    if (!Number.isFinite(safeQty) || safeQty <= 0) return;

    grouped[safeName] = (grouped[safeName] || 0) + safeQty;
  };

  const addFromArray = (source) => {
    if (!Array.isArray(source)) return;

    source.forEach((entry) => {
      if (entry == null) return;

      if (typeof entry === "string" || typeof entry === "number") {
        addEntry(entry, 1);
        return;
      }

      if (typeof entry === "object") {
        const name =
          entry.name ||
          entry.nome ||
          entry.label ||
          entry.title ||
          entry.productName ||
          entry.description;

        const qty = entry.quantity ?? entry.qtd ?? entry.qty ?? 1;
        addEntry(name, qty);
      }
    });
  };

  const addFromQuantityObject = (source, prefix = "Ingrediente") => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return;

    Object.entries(source).forEach(([nameOrId, qty]) => {
      if (Number(qty) <= 0) return;

      const resolvedName = /^\d+$/.test(String(nameOrId))
        ? `${prefix} ${nameOrId}`
        : String(nameOrId);

      addEntry(resolvedName, Number(qty));
    });
  };

  addFromArray(item.selectedIngredientNames);
  addFromArray(item.selectedSauceNames);
  addFromArray(item.selectedDrinkNames);
  addFromArray(item.selectedBreadNames);
  addFromArray(item.ingredients);
  addFromArray(item.additions);
  addFromArray(item.extras);
  addFromArray(item.acrescimos);

  addFromQuantityObject(item.ingredientQuantities, "Ingrediente");
  addFromQuantityObject(item.sauceQuantities, "Molho");
  addFromQuantityObject(item.drinkQuantities, "Bebida");

  return Object.entries(grouped).map(([name, qty]) => ({
    name,
    qty,
  }));
}

function buildCartFromOrder(order) {
  const now = Date.now();
  const items = Array.isArray(order?.items) ? order.items : [];

  return items
    .filter((item) => item && item.productId != null)
    .map((item, index) => {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitPrice = Number(
        item.unitPrice ?? (item.subtotal != null ? item.subtotal / quantity : 0),
      );

      return {
        id: `${item.productId}-${now}-${index}`,
        originalProductId: Number(item.productId),
        nome: item.productName || `Produto #${item.productId}`,
        preco: Number.isFinite(unitPrice) ? unitPrice : 0,
        qtd: quantity,
        imagem: "/placeholder.jpg",
        categoria: "",
        descricao: "",
        isCustom: false,
        meatPoint: null,
        ingredients: [],
        drinks: [],
        breads: [],
        sauces: [],
        selectedIngredientIds: [],
        selectedIngredientNames: [],
        selectedSauceIds: [],
        selectedSauceNames: [],
        observation: item.observations || "",
      };
    });
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedItemsByOrder, setExpandedItemsByOrder] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await http.get("/orders/me?page=0&size=1000");
      const normalized = normalizeOrdersPayload(data);
      const sorted = [...normalized].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      setOrders(sorted);
    } catch (err) {
      console.error("Erro ao carregar pedidos do usuario:", err);
      setError(err.message || "Nao foi possivel carregar seus pedidos agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  const filteredOrders = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt || 0);
      if (Number.isNaN(createdAt.getTime())) return false;
      if (from && createdAt < from) return false;
      if (to && createdAt > to) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  const hasDateFilter = !!dateFrom || !!dateTo;

  const visibleOrders = useMemo(
    () => filteredOrders.slice(0, visibleOrdersCount),
    [filteredOrders, visibleOrdersCount],
  );

  const hasMoreOrders = visibleOrdersCount < filteredOrders.length;

  useEffect(() => {
    // Reseta a paginacao quando a fonte da lista muda
    setVisibleOrdersCount(10);
    setExpandedItemsByOrder({});
  }, [dateFrom, dateTo, orders.length]);

  useEffect(() => {
    if (!selectedOrder) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [selectedOrder]);

  const handleTrackOrder = (orderId) => {
    localStorage.setItem("lastOrderId", String(orderId));
    navigate("/order-status");
  };

  const handleReorder = (order) => {
    const rebuiltCart = buildCartFromOrder(order);

    if (!rebuiltCart.length) {
      toast.error("Nao foi possivel recriar esse pedido.");
      return;
    }

    localStorage.setItem(CHAVE_CART, JSON.stringify(rebuiltCart));
    window.dispatchEvent(new Event("cartUpdated"));

    if (order?.address?.id != null) {
      localStorage.setItem("checkout-address-id", String(order.address.id));
    }

    toast.success("Pedido carregado no checkout.");
    navigate("/checkout");
  };

  const toggleItemsExpansion = (orderId) => {
    setExpandedItemsByOrder((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <>
      <MenuButtonAuto />

      <section className="my-orders-page min-h-screen bg-transparent px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-red-300 hover:text-red-700"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <header className="mb-6 rounded-2xl border border-zinc-200 bg-transparent p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="w-full text-center md:w-auto md:text-left">
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
                  Meus pedidos
                </h1>
                <p className="mt-1 text-sm text-zinc-600 md:text-base">
                  Acompanhe seu histórico e repita seus favoritos em um clique.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100/40"
              >
                <RefreshCw size={16} />
                Atualizar
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm font-semibold text-zinc-700">
                <ShoppingBag size={15} />
                {totalOrders} pedido(s)
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-transparent px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Filtro de data
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-transparent px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-red-400"
                />
                <span className="text-xs font-semibold text-zinc-500">até</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-transparent px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-red-400"
                />
                {hasDateFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </header>

          {loading && (
            <div className="rounded-2xl border border-zinc-200 bg-transparent p-8 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <Loader2 size={30} className="mx-auto mb-3 animate-spin text-red-700" />
              <p className="text-sm font-medium text-zinc-600">Buscando seus pedidos...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-300 bg-transparent p-6 text-rose-800 shadow-sm">
              <p className="mb-4 text-sm font-semibold">{error}</p>
              <button
                type="button"
                onClick={fetchOrders}
                className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-800"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-transparent p-8 text-center shadow-sm">
              <Package size={28} className="mx-auto mb-2 text-zinc-500" />
              <h2 className="text-lg font-bold text-zinc-900">Nenhum pedido ainda</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Seus pedidos finalizados vao aparecer aqui para repetir quando quiser.
              </p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-transparent p-8 text-center shadow-sm">
              <Package size={28} className="mx-auto mb-2 text-zinc-500" />
              <h2 className="text-lg font-bold text-zinc-900">Nenhum pedido nesse periodo</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Ajuste o filtro de data para visualizar outros pedidos.
              </p>
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="space-y-4">
              {visibleOrders.map((order) => {
                const normalizedStatus = normalizeStatus(order.status);
                const statusLabel = STATUS_LABELS[normalizedStatus] || normalizedStatus;
                const statusClass =
                  STATUS_STYLES[normalizedStatus] ||
                  "bg-gray-100 text-gray-700 border-gray-300";

                const orderItems = Array.isArray(order.items) ? order.items : [];
                const isItemsExpanded = !!expandedItemsByOrder[order.id];
                const visibleItems = isItemsExpanded ? orderItems : orderItems.slice(0, 3);
                const hiddenItemsCount = Math.max(0, orderItems.length - visibleItems.length);
                const orderAdditionsCount = orderItems.reduce(
                  (acc, item) => acc + parseItemAdditions(item).length,
                  0,
                );

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-zinc-200 bg-transparent p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-zinc-100 pb-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Pedido #{order.id}</p>
                        <p className="mt-1 text-lg font-black tracking-tight text-zinc-900">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
                      >
                        <span className={STATUS_ICON_STYLES[normalizedStatus] || "text-zinc-700"}>
                          <StatusIcon status={normalizedStatus} size={13} />
                        </span>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm text-zinc-700 md:grid-cols-3">
                      <div className="rounded-xl border border-zinc-200 bg-transparent px-3 py-2.5 text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                          Data e horário
                        </p>
                        <p className="inline-flex items-center justify-center gap-2 font-medium text-zinc-800">
                          <Clock3 size={16} className="text-zinc-500" />
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-transparent px-3 py-2.5 text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                          Itens do pedido
                        </p>
                        <div className="space-y-2">
                          {orderItems.length === 0 && (
                            <p className="text-zinc-600">Sem itens</p>
                          )}
                          {orderItems.length > 0 && (
                            <ul className="space-y-1.5">
                              {visibleItems.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start justify-center gap-2 text-center text-zinc-800"
                                >
                                  <ShoppingBag size={14} className="mt-0.5 shrink-0 text-zinc-500" />
                                  <span className="leading-snug font-medium break-all">
                                    {item.quantity}x {item.productName || `Produto #${item.productId}`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                            {hiddenItemsCount > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleItemsExpansion(order.id)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-300 bg-transparent px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100/60"
                              >
                                <ChevronDown size={13} />
                                Ver mais {hiddenItemsCount}
                              </button>
                            )}

                            {isItemsExpanded && orderItems.length > 3 && (
                              <button
                                type="button"
                                onClick={() => toggleItemsExpansion(order.id)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-300 bg-transparent px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100/60"
                              >
                                <ChevronUp size={13} />
                                Mostrar menos
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
                            >
                              <Eye size={13} />
                              Ver detalhes do pedido
                            </button>
                          </div>

                          {(orderAdditionsCount > 0 || order.observations) && (
                            <p className="pt-1 text-center text-[11px] font-medium text-zinc-500">
                              {orderAdditionsCount > 0
                                ? `${orderAdditionsCount} acrescimo(s) detectado(s)`
                                : "Com observacoes"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-transparent px-3 py-2.5 text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                          Endereço de entrega
                        </p>
                        <p className="inline-flex items-start justify-center gap-2 leading-snug text-zinc-800 wrap-break-word">
                          <MapPin size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                          <span>
                            {getAddressLabel(order)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      {["PENDENTE", "CONFIRMADO", "PREPARANDO"].includes(normalizedStatus) && (
                        <button
                          type="button"
                          onClick={() => handleTrackOrder(order.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100/50"
                        >
                          <Truck size={16} />
                          Acompanhar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        aria-label={`Quero pedir de novo o pedido #${order.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 active:scale-[0.98]"
                      >
                        <ShoppingBag size={16} />
                        Quero pedir de novo
                      </button>
                    </div>
                  </article>
                );
              })}

              {hasMoreOrders && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleOrdersCount((prev) => prev + 10)}
                    className="rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100/50"
                  >
                    Carregar mais pedidos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 z-150 flex items-end justify-center bg-zinc-950/55 p-0 backdrop-blur-[2px] md:items-center md:p-4">
            <div className="my-orders-modal max-h-[90vh] w-full overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.35)] md:max-w-3xl md:rounded-2xl">
              <div className="my-orders-modal-header flex items-start justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 md:px-5">
                <div className="text-center md:text-left">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Detalhes do pedido
                  </p>
                  <h3 className="text-lg font-black text-zinc-900 md:text-xl">
                    Pedido #{selectedOrder.id}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-zinc-600">
                    {formatOrderDate(selectedOrder.createdAt)} • {formatCurrency(selectedOrder.total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-100"
                  aria-label="Fechar detalhes do pedido"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="max-h-[calc(90vh-74px)] overflow-y-auto px-4 py-4 md:px-5">
                <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-center text-sm text-zinc-700">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                    Endereco de entrega
                  </p>
                  <p className="inline-flex items-start justify-center gap-2 leading-snug text-zinc-800 wrap-break-word">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-zinc-500" />
                    <span>{getAddressLabel(selectedOrder)}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).length === 0 && (
                    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-600">
                      Sem itens neste pedido.
                    </div>
                  )}

                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, idx) => {
                    const additions = parseItemAdditions(item);
                    return (
                      <article
                        key={`${item.productId || "item"}-${idx}`}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="inline-flex max-w-full items-center gap-2 text-sm font-bold text-zinc-900">
                            <ShoppingBag size={15} className="text-zinc-600" />
                            <span className="break-all text-center">
                              {item.quantity || 1}x {item.productName || `Produto #${item.productId}`}
                            </span>
                          </p>
                          {item.subtotal != null && (
                            <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-bold text-zinc-700">
                              {formatCurrency(item.subtotal)}
                            </span>
                          )}
                        </div>

                        {additions.length > 0 && (
                          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-2">
                            <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                              <PlusCircle size={13} />
                              Acrescimos
                            </p>
                            <div className="flex flex-wrap justify-center gap-1.5">
                              {additions.map((addition, adIdx) => (
                                <span
                                  key={`${addition.name}-${adIdx}`}
                                  className="rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-xs font-semibold text-emerald-800"
                                >
                                  +{addition.qty} {addition.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.observations && (
                          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-2">
                            <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                              <MessageSquare size={13} />
                              Observações do item
                            </p>
                            <p className="text-center text-sm leading-snug text-amber-900 break-all">
                              {item.observations}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>

                {selectedOrder.observations && (
                  <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-center">
                    <p className="mb-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-600">
                      <FileText size={13} />
                      Observacoes gerais do pedido
                    </p>
                    <p className="text-center text-sm leading-snug text-zinc-800 break-all">
                      {selectedOrder.observations}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-zinc-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleReorder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800"
                  >
                    <ShoppingBag size={15} />
                    Quero pedir de novo
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 -z-10"
              aria-label="Fechar modal de detalhes"
            />
          </div>
        )}
      </section>
    </>
  );
}
