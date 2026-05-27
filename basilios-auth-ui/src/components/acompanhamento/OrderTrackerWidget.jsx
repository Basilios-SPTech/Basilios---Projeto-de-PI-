import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Minus,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import { http } from "../../services/http.js";
import { authStorage } from "../../services/storageAuth.js";
import OrderStatusSoundNotifier from "./OrderStatusSoundNotifier.jsx";

const ORDER_ID_KEY = "lastOrderId";
const PIX_ID_KEY = "pixId";
const PIX_ORDER_ID_KEY = "pixOrderId";
const COLLAPSED_KEY = "order-tracker-widget.collapsed.v1";
const POSITION_KEY = "order-tracker-widget.position.v1";
const ACTIVE_STATUSES = ["PENDENTE", "CONFIRMADO", "PREPARANDO", "DESPACHADO"];

const STATUS_STEPS = ["PENDENTE", "CONFIRMADO", "PREPARANDO", "DESPACHADO"];

const STATUS_LABELS = {
  PENDENTE: "Aguardando confirmacao",
  CONFIRMADO: "Pedido confirmado",
  PREPARANDO: "Em preparo",
  DESPACHADO: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_ORB_THEME = {
  PENDENTE: {
    base: "#BB3530",
    shadow: "rgba(187,53,48,.36)",
    glow: "rgba(187,53,48,.24)",
  },
  CONFIRMADO: {
    base: "#2563EB",
    shadow: "rgba(37,99,235,.34)",
    glow: "rgba(37,99,235,.24)",
  },
  PREPARANDO: {
    base: "#D97706",
    shadow: "rgba(217,119,6,.34)",
    glow: "rgba(217,119,6,.24)",
  },
  DESPACHADO: {
    base: "#16A34A",
    shadow: "rgba(22,163,74,.34)",
    glow: "rgba(22,163,74,.24)",
  },
  ENTREGUE: {
    base: "#059669",
    shadow: "rgba(5,150,105,.34)",
    glow: "rgba(5,150,105,.24)",
  },
  CANCELADO: {
    base: "#7F1D1D",
    shadow: "rgba(127,29,29,.34)",
    glow: "rgba(127,29,29,.24)",
  },
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
    ["CONFIRMADO", "CONFIRMACAO"].includes(normalized) ||
    rawStatus.includes("CONFIRM") ||
    rawStatus.includes("ACEIT")
  ) {
    return "CONFIRMADO";
  }

  if (["EM_PREPARO", "PREPARANDO"].includes(normalized)) return "PREPARANDO";
  if (["SAIU_PARA_ENTREGA", "DESPACHADO"].includes(normalized)) return "DESPACHADO";
  if (normalized === "ENTREGUE") return "ENTREGUE";
  if (normalized === "CANCELADO") return "CANCELADO";

  return "PENDENTE";
}

function getStatusIcon(status, size = 16) {
  if (status === "PENDENTE") return <Clock3 size={size} />;
  if (status === "CONFIRMADO") return <CheckCircle2 size={size} />;
  if (status === "PREPARANDO") return <Package size={size} />;
  if (status === "DESPACHADO") return <Truck size={size} />;
  if (status === "ENTREGUE") return <MapPin size={size} />;
  if (status === "CANCELADO") return <XCircle size={size} />;
  return <Package size={size} />;
}

function getEstimatedSize(collapsed) {
  if (collapsed) return { width: 48, height: 48 };
  return { width: 324, height: 208 };
}

function clampPosition(next, size) {
  if (typeof window === "undefined") return next;

  const padding = 8;
  const maxX = Math.max(padding, window.innerWidth - size.width - padding);
  const maxY = Math.max(padding, window.innerHeight - size.height - padding);

  return {
    x: Math.min(Math.max(next.x, padding), maxX),
    y: Math.min(Math.max(next.y, padding), maxY),
  };
}

function remapPositionForSizeChange(prevPosition, fromSize, toSize) {
  if (typeof window === "undefined") return prevPosition;

  const edgeSnapThreshold = 24;
  const rightGap = window.innerWidth - (prevPosition.x + fromSize.width);
  const bottomGap = window.innerHeight - (prevPosition.y + fromSize.height);

  let nextX = prevPosition.x;
  let nextY = prevPosition.y;

  if (prevPosition.x <= edgeSnapThreshold) {
    nextX = prevPosition.x;
  } else if (rightGap <= edgeSnapThreshold) {
    nextX = window.innerWidth - toSize.width - rightGap;
  }

  if (prevPosition.y <= edgeSnapThreshold) {
    nextY = prevPosition.y;
  } else if (bottomGap <= edgeSnapThreshold) {
    nextY = window.innerHeight - toSize.height - bottomGap;
  }

  return clampPosition({ x: nextX, y: nextY }, toSize);
}

function readCollapsedPreference() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function getDefaultPosition(collapsed) {
  if (typeof window === "undefined") return { x: 16, y: 16 };

  const size = getEstimatedSize(collapsed);
  return clampPosition(
    {
      x: window.innerWidth - size.width - 20,
      y: window.innerHeight - size.height - 20,
    },
    size,
  );
}

function readStoredPosition(collapsed) {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return getDefaultPosition(collapsed);

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      !Number.isFinite(Number(parsed.x)) ||
      !Number.isFinite(Number(parsed.y))
    ) {
      return getDefaultPosition(collapsed);
    }

    return clampPosition(
      { x: Number(parsed.x), y: Number(parsed.y) },
      getEstimatedSize(collapsed),
    );
  } catch {
    return getDefaultPosition(collapsed);
  }
}

function formatCreatedAt(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTrackerWidget() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => readCollapsedPreference());
  const [position, setPosition] = useState(() => readStoredPosition(readCollapsedPreference()));
  const [orderId, setOrderId] = useState(() => {
    try {
      return localStorage.getItem(ORDER_ID_KEY);
    } catch {
      return null;
    }
  });
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingPix, setHasPendingPix] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    authStorage.isAuthenticated(),
  );
  const [orbFlash, setOrbFlash] = useState(false);

  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const previousStatusRef = useRef(null);

  const status = normalizeStatus(order?.status);
  const orbTheme = STATUS_ORB_THEME[status] || STATUS_ORB_THEME.PENDENTE;
  const statusLabel = STATUS_LABELS[status] || "Aguardando confirmacao";
  const statusIndex = Math.max(0, STATUS_STEPS.findIndex((step) => step === status));
  const isInProgress = ACTIVE_STATUSES.includes(status);

  const shouldHideByRoute = location.pathname === "/order-status";
  const shouldShow =
    Boolean(orderId) &&
    isAuthenticated &&
    !shouldHideByRoute &&
    !hasPendingPix;

  const orderNumber = order?.id ?? orderId;
  const createdAtLabel = formatCreatedAt(order?.createdAt);

  const trackerSummary = useMemo(() => {
    if (isLoading && !order) return "Atualizando pedido";
    return statusLabel;
  }, [isLoading, order, statusLabel]);

  useEffect(() => {
    const unsubscribe = authStorage.subscribe((snapshot) => {
      setIsAuthenticated(Boolean(snapshot?.isAuthenticated));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const syncOrderId = () => {
      try {
        const next = localStorage.getItem(ORDER_ID_KEY);
        const pixId = localStorage.getItem(PIX_ID_KEY);
        const pixOrderId = localStorage.getItem(PIX_ORDER_ID_KEY);

        setOrderId((prev) => (prev === next ? prev : next));

        const hasPendingPixForOrder =
          Boolean(pixId) &&
          Boolean(next) &&
          (!pixOrderId || String(pixOrderId) === String(next));

        setHasPendingPix(hasPendingPixForOrder);
      } catch {
        setOrderId(null);
        setHasPendingPix(false);
      }
    };

    syncOrderId();

    const storageHandler = (event) => {
      if (
        !event ||
        event.key === ORDER_ID_KEY ||
        event.key === PIX_ID_KEY ||
        event.key === PIX_ORDER_ID_KEY
      ) {
        syncOrderId();
      }
    };

    const timer = window.setInterval(syncOrderId, 3000);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", storageHandler);
    };
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    if (isAuthenticated) return;

    setHasPendingPix(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!orderId || !isAuthenticated) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOrder = async () => {
      if (!cancelled) setIsLoading(true);

      try {
        const response = await http.get(`/orders/${orderId}`);
        if (cancelled) return;

        const payload = response?.data;
        const nextStatus = normalizeStatus(payload?.status);

        if (["ENTREGUE", "CANCELADO"].includes(nextStatus)) {
          try {
            localStorage.removeItem(ORDER_ID_KEY);
          } catch {
            // noop
          }
          setOrder(null);
          setOrderId(null);
          return;
        }

        setOrder(payload || null);
      } catch (err) {
        if (cancelled) return;

        if (err?.status === 404) {
          try {
            localStorage.removeItem(ORDER_ID_KEY);
          } catch {
            // noop
          }
          setOrder(null);
          setOrderId(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchOrder();
    const pollTimer = window.setInterval(fetchOrder, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(pollTimer);
    };
  }, [orderId, isAuthenticated]);

  useEffect(() => {
    if (!shouldShow) {
      previousStatusRef.current = null;
      setOrbFlash(false);
      return;
    }

    const previous = previousStatusRef.current;
    previousStatusRef.current = status;

    if (!previous || previous === status || !collapsed) return;

    setOrbFlash(true);
    const timer = window.setTimeout(() => {
      setOrbFlash(false);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [status, collapsed, shouldShow]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      // noop
    }
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    } catch {
      // noop
    }
  }, [position]);

  useEffect(() => {
    const onResize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const size = {
        width: rect?.width || getEstimatedSize(collapsed).width,
        height: rect?.height || getEstimatedSize(collapsed).height,
      };

      setPosition((prev) => clampPosition(prev, size));
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [collapsed]);

  useEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const size = {
      width: rect?.width || getEstimatedSize(collapsed).width,
      height: rect?.height || getEstimatedSize(collapsed).height,
    };

    setPosition((prev) => clampPosition(prev, size));
  }, [collapsed]);

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.pointerId != null && event.pointerId !== drag.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      drag.moved = true;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const size = {
      width: rect?.width || getEstimatedSize(collapsed).width,
      height: rect?.height || getEstimatedSize(collapsed).height,
    };

    const nextPosition = clampPosition(
      {
        x: drag.originX + dx,
        y: drag.originY + dy,
      },
      size,
    );

    setPosition(nextPosition);
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.pointerId != null && event.pointerId !== drag.pointerId) {
      return;
    }

    if (drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    dragRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const startDrag = (event) => {
    if (event.button != null && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const openTrackingPage = () => {
    navigate("/order-status");
  };

  const setCollapsedWithPosition = (nextCollapsed) => {
    if (nextCollapsed === collapsed) return;

    setPosition((prev) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const fromSize = {
        width: rect?.width || getEstimatedSize(collapsed).width,
        height: rect?.height || getEstimatedSize(collapsed).height,
      };
      const toSize = getEstimatedSize(nextCollapsed);

      return remapPositionForSizeChange(prev, fromSize, toSize);
    });

    setCollapsed(nextCollapsed);
  };

  const handleExpandFromOrb = () => {
    if (suppressClickRef.current) return;
    setCollapsedWithPosition(false);
  };

  const statusTone =
    status === "DESPACHADO"
      ? "text-emerald-600"
      : status === "CONFIRMADO"
        ? "text-blue-600"
        : status === "PREPARANDO"
          ? "text-amber-600"
          : "text-[#BB3530]";

  if (!shouldShow) return null;

  return (
    <>
      <OrderStatusSoundNotifier status={status} enabled={shouldShow && isInProgress} />

      <style>{`
        @keyframes trackerPulse {
          0% { transform: scale(1); opacity: 0.88; }
          50% { transform: scale(1.08); opacity: 0.48; }
          100% { transform: scale(1); opacity: 0.88; }
        }
        @keyframes trackerStatusFlash {
          0% { transform: scale(1); opacity: 0.95; }
          35% { transform: scale(1.2); opacity: 0.55; }
          70% { transform: scale(1.08); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.95; }
        }
      `}</style>

      <div
        ref={containerRef}
        className="fixed"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1500,
        }}
      >
        {collapsed ? (
          <button
            type="button"
            onPointerDown={startDrag}
            onClick={handleExpandFromOrb}
            title={`Pedido #${orderNumber} - ${trackerSummary}`}
            className="relative h-12 w-12 rounded-full text-white ring-2 ring-white/70"
            style={{
              touchAction: "none",
              backgroundColor: orbTheme.base,
              boxShadow: orbFlash
                ? `0 0 0 8px ${orbTheme.glow}, 0 14px 26px ${orbTheme.shadow}`
                : `0 12px 24px ${orbTheme.shadow}`,
              transition: "background-color .35s ease, box-shadow .35s ease",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: orbTheme.base,
                animation: orbFlash
                  ? "trackerStatusFlash .95s ease-out 2, trackerPulse 2.6s ease-in-out infinite"
                  : "trackerPulse 2.6s ease-in-out infinite",
              }}
            />
            <span className="relative z-10 inline-flex h-full w-full items-center justify-center">
              {getStatusIcon(status, 17)}
            </span>
          </button>
        ) : (
          <div className="w-[324px] max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_22px_50px_rgba(2,8,23,.22)]">
            <div
              onPointerDown={startDrag}
              className="flex cursor-grab items-center justify-between bg-linear-to-r from-[#BB3530] to-[#9b2b20] px-3 py-2 text-white active:cursor-grabbing"
              style={{ touchAction: "none" }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                {getStatusIcon(status, 15)}
                <span>Pedido em andamento</span>
              </div>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
                onClick={() => setCollapsedWithPosition(true)}
                title="Recolher"
              >
                <Minus size={16} />
              </button>
            </div>

            <div className="space-y-3 p-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Pedido
                </p>
                <p className="text-sm font-bold text-zinc-900">#{orderNumber}</p>
                {createdAtLabel ? (
                  <p className="mt-0.5 text-xs text-zinc-500">Criado em {createdAtLabel}</p>
                ) : null}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    Status atual
                  </p>
                  <span className={`text-sm font-bold ${statusTone}`}>{statusLabel}</span>
                </div>
                <div className="flex gap-1.5">
                  {STATUS_STEPS.map((step, index) => {
                    const isActive = index <= statusIndex;
                    return (
                      <span
                        key={step}
                        className={`h-1.5 flex-1 rounded-full ${isActive ? "bg-[#BB3530]" : "bg-zinc-200"}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openTrackingPage}
                  className="flex-1 rounded-lg bg-[#BB3530] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9b2b20]"
                >
                  Acompanhar pedido
                </button>
              </div>

              {!isInProgress && !isLoading ? (
                <p className="text-xs text-zinc-500">
                  Esse pedido nao esta mais em andamento.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
