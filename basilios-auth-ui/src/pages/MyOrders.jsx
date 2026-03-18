import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Clock3,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import MenuButtonAuto from "../components/MenuButtonAuto.jsx";
import { http } from "../services/http.js";
import { formatCurrency } from "../utils/formatters.js";

const CHAVE_CART = "carrinho-basilios";

const STATUS_LABELS = {
  PREPARANDO: "Em preparação",
  DESPACHADO: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_STYLES = {
  PREPARANDO: "bg-amber-100 text-amber-800 border-amber-300",
  DESPACHADO: "bg-cyan-100 text-cyan-800 border-cyan-300",
  ENTREGUE: "bg-emerald-100 text-emerald-700 border-emerald-300",
  CANCELADO: "bg-rose-100 text-rose-700 border-rose-300",
};

function normalizeStatus(status) {
  if (!status) return "PREPARANDO";

  const normalized = String(status)
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["RECEBIDO", "PENDENTE", "CONFIRMADO", "EM_PREPARO", "PREPARANDO"].includes(normalized)) {
    return "PREPARANDO";
  }

  if (["SAIU_PARA_ENTREGA", "DESPACHADO"].includes(normalized)) {
    return "DESPACHADO";
  }

  if (normalized === "ENTREGUE") return "ENTREGUE";
  if (normalized === "CANCELADO") return "CANCELADO";

  return "PREPARANDO";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await http.get("/orders/me");
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

  return (
    <>
      <MenuButtonAuto />

      <section className="min-h-screen bg-gray-100 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-red-600"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <header className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Meus pedidos
                </h1>
                <p className="mt-1 text-sm text-gray-600 md:text-base">
                  Reveja seus pedidos recentes aqui.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Atualizar
              </button>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              <ShoppingBag size={15} />
              {totalOrders} pedido(s)
            </div>
          </header>

          {loading && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <Loader2 size={30} className="mx-auto mb-3 animate-spin text-red-600" />
              <p className="text-sm text-gray-600">Buscando seus pedidos...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-rose-800 shadow-sm">
              <p className="mb-4 text-sm font-medium">{error}</p>
              <button
                type="button"
                onClick={fetchOrders}
                className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-800"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <Package size={28} className="mx-auto mb-2 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Nenhum pedido ainda</h2>
              <p className="mt-1 text-sm text-gray-600">
                Seus pedidos finalizados vao aparecer aqui para repetir quando quiser.
              </p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const normalizedStatus = normalizeStatus(order.status);
                const statusLabel = STATUS_LABELS[normalizedStatus] || normalizedStatus;
                const statusClass =
                  STATUS_STYLES[normalizedStatus] ||
                  "bg-gray-100 text-gray-700 border-gray-300";

                const orderItems = Array.isArray(order.items) ? order.items : [];

                return (
                  <article
                    key={order.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{order.id}</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-3">
                      <p className="inline-flex items-center gap-2">
                        <Clock3 size={16} className="text-gray-500" />
                        {formatOrderDate(order.createdAt)}
                      </p>

                      <div className="inline-flex items-start gap-2">
                        <ShoppingBag size={16} className="text-gray-500 mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-0.5">
                          {orderItems.length === 0 && (
                            <span>Sem itens</span>
                          )}
                          {orderItems.map((item, idx) => (
                            <span key={idx}>
                              {item.quantity}x {item.productName || `Produto #${item.productId}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="inline-flex items-start gap-2">
                        <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
                        <span>
                          {order.address?.enderecoCompleto ||
                            (order.address
                              ? [
                                  order.address.rua,
                                  order.address.numero,
                                  order.address.complemento,
                                  order.address.bairro,
                                  order.address.cidade,
                                  order.address.estado,
                                ]
                                  .filter(Boolean)
                                  .join(", ")
                              : "Endereço não informado")}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      {["CONFIRMADO", "PREPARANDO", "DESPACHADO"].includes(normalizedStatus) && (
                        <button
                          type="button"
                          onClick={() => handleTrackOrder(order.id)}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          Acompanhar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800"
                      >
                        Pedir novamente
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
