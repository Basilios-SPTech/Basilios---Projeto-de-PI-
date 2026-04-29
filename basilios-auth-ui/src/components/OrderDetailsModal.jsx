import { useEffect } from "react";
import { MapPin, Package, Clock, X } from "lucide-react";

function extractMeatPoint(observations) {
  const raw = String(observations || "");
  const match = raw.match(/PONTO DA CARNE:\s*([^|]+)/i);
  const meatPoint = match?.[1]?.trim() || "";
  const remaining = raw
    .replace(/PONTO DA CARNE:\s*[^|]+/i, "")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/^\s*\|\s*|\s*\|\s*$/g, "")
    .trim();

  return { meatPoint, remaining };
}

export default function OrderDetailsModal({ isOpen, order, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div
      className="fixed inset-0 z-1000 bg-black/50 flex items-center justify-center p-4"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Enter" && onClose()}
      aria-label="Fechar modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-neutral-500" />
            <h3 className="text-lg font-bold text-neutral-900">
              Pedido #{order.orderId}
            </h3>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-neutral-200 p-1 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4" />
            <span>{order.createdAt}</span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const { meatPoint, remaining } = extractMeatPoint(item.observations);
              const adicionaisList = Array.isArray(item.adicionais)
                ? item.adicionais
                : [];

              return (
                <div
                  key={index}
                  className="rounded-lg border border-neutral-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {item.quantity}x {item.hadPromotion ? "Promocao" : item.productName}
                      </p>
                      {meatPoint && (
                        <div className="mt-1 inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          Ponto da carne: {meatPoint}
                        </div>
                      )}
                      {remaining && (
                        <p className="mt-1 text-xs text-neutral-500 italic">
                          {remaining}
                        </p>
                      )}
                      {adicionaisList.length > 0 && (
                        <p className="mt-2 text-xs text-neutral-600">
                          <span className="font-semibold">Adicionais:</span>{" "}
                          {adicionaisList
                            .map((adicional) => {
                              const name =
                                adicional?.adicionalName ||
                                adicional?.name ||
                                `Adicional ${adicional?.adicionalId}`;
                              const qty = Math.max(
                                1,
                                Number(adicional?.quantity ?? 1) || 1,
                              );
                              return `${name} x${qty}`;
                            })
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900">
                        R$ {Number(item.subtotal || 0).toFixed(2)}
                      </p>
                      {item.hadPromotion && item.originalPrice && (
                        <p className="text-xs text-neutral-400 line-through">
                          R$ {Number(item.originalPrice || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-neutral-200 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <MapPin className="w-4 h-4" />
              Entrega
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              <p>
                {order.address?.rua}, {order.address?.numero}
                {order.address?.complemento
                  ? ` - ${order.address?.complemento}`
                  : ""}
              </p>
              <p>
                {order.address?.bairro} - {order.address?.cidade}/{order.address?.estado}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                CEP {order.address?.cep}
              </p>
            </div>
          </div>

          {order.observations && (
            <div className="rounded-lg border border-neutral-200 bg-amber-50/70 p-3">
              <p className="text-xs text-neutral-700">
                <span className="font-semibold">Obs:</span> {order.observations}
              </p>
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span>R$ {Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Entrega</span>
              <span>R$ {Number(order.deliveryFee || 0).toFixed(2)}</span>
            </div>
            {Number(order.discount || 0) > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Desconto</span>
                <span>- R$ {Number(order.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between text-base font-bold text-neutral-900 border-t border-neutral-200 pt-2">
              <span>Total</span>
              <span>R$ {Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
