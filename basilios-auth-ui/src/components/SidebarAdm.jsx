/** SidebarAdm */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Home, ListOrdered, LogOut, Package, Hamburger, LayoutDashboard, LogIn, UserRound, Gift, Store } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../services/api";
import { authStorage } from "../services/storageAuth";
import { http } from "../services/http";
import ThemeSwitcher from "./ThemeSwitcher";
import "../styles/side-bar.css";

const BOARD_SEEN_PENDING_IDS_KEY = "basilios.board.seen.pending.ids.v1";

function normalizeBoardStatus(status) {
  if (!status) return "PENDENTE";

  const normalized = String(status)
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["RECEBIDO", "PENDENTE"].includes(normalized)) return "PENDENTE";
  if (["EM_PREPARO", "PREPARANDO"].includes(normalized)) return "PREPARANDO";
  if (["SAIU_PARA_ENTREGA", "DESPACHADO"].includes(normalized)) return "DESPACHADO";
  if (normalized === "ENTREGUE") return "ENTREGUE";
  if (normalized === "CANCELADO") return "CANCELADO";

  return normalized;
}

function readSeenPendingOrderIds() {
  try {
    const raw = localStorage.getItem(BOARD_SEEN_PENDING_IDS_KEY);
    if (!raw) return new Set();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();

    return new Set(
      parsed
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value)),
    );
  } catch {
    return new Set();
  }
}

function writeSeenPendingOrderIds(ids) {
  try {
    const safeIds = Array.from(
      new Set(
        (ids || [])
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value)),
      ),
    );
    localStorage.setItem(BOARD_SEEN_PENDING_IDS_KEY, JSON.stringify(safeIds));
  } catch {
    // noop
  }
}

export default function SidebarAdm({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  let isLogged = false;
  try { isLogged = !!authStorage.getToken(); } catch { isLogged = false; }

  const isFuncionario = authStorage.hasAnyRole("ROLE_FUNCIONARIO");
  const isAdmin = authStorage.hasAnyRole("ROLE_ADMIN");
  const [newBoardOrdersCount, setNewBoardOrdersCount] = useState(0);
  const [pendingBoardOrderIds, setPendingBoardOrderIds] = useState([]);

  const markBoardOrdersAsSeen = useCallback((ids) => {
    const source = Array.isArray(ids) ? ids : pendingBoardOrderIds;
    writeSeenPendingOrderIds(source);
    setNewBoardOrdersCount(0);
  }, [pendingBoardOrderIds]);

  const syncBoardOrdersCounter = useCallback(async () => {
    if (!isLogged || !isFuncionario) {
      setNewBoardOrdersCount(0);
      setPendingBoardOrderIds([]);
      return;
    }

    try {
      const { data } = await http.get("/orders", { params: { page: 0, size: 50 } });
      const orders = Array.isArray(data) ? data : (data?.content ?? []);

      const pendingIds = orders
        .filter((order) => normalizeBoardStatus(order?.status) === "PENDENTE")
        .map((order) => Number(order?.id))
        .filter((id) => Number.isFinite(id));

      setPendingBoardOrderIds(pendingIds);

      if (location.pathname === "/board") {
        writeSeenPendingOrderIds(pendingIds);
        setNewBoardOrdersCount(0);
        return;
      }

      const seenIds = readSeenPendingOrderIds();
      const unseenCount = pendingIds.filter((id) => !seenIds.has(id)).length;
      setNewBoardOrdersCount(unseenCount);
    } catch {
      // Silencioso na sidebar para não poluir a UI com toasts de polling.
    }
  }, [isFuncionario, isLogged, location.pathname]);

  useEffect(() => {
    if (!open) return;

    syncBoardOrdersCounter();

    const timer = window.setInterval(syncBoardOrdersCounter, 10000);

    return () => {
      window.clearInterval(timer);
    };
  }, [open, syncBoardOrdersCounter]);

  useEffect(() => {
    if (!open) return;
    if (location.pathname !== "/board") return;

    markBoardOrdersAsSeen();
  }, [location.pathname, markBoardOrdersAsSeen, open]);

  const menuSections = useMemo(() => {
    if (!isLogged) {
      return {
        guestItems: [
          { icon: Home, label: "Início", href: "/home" },
          { icon: Hamburger, label: "Sobre Nós", href: "/about" },
          { icon: LogIn, label: "Entrar", href: "/login" },
        ],
      };
    }

    const topItems = [
      { icon: Home, label: "Início", href: "/home" },
    ];

    const adminItems = [
      ...(isFuncionario
        ? [
            { icon: Package, label: "Cadastrar Produto", href: "/cadastro" },
            { icon: ListOrdered, label: "Pedidos (Board)", href: "/board", badgeCount: newBoardOrdersCount },
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Gift, label: "Promoções", href: "/promocoes" },
            { icon: Store, label: "Informações da Loja", href: "/profile?section=store" },
          ]
        : []),
    ];

    const clientItems = [
      { icon: ListOrdered, label: "Meus Pedidos", href: "/meus-pedidos" },
      { icon: UserRound, label: "Meu Perfil", href: "/profile" },
      { icon: Hamburger, label: "Sobre Nós", href: "/about" },
    ];

    const bottomItems = [
      { icon: LogOut, label: "Sair", href: "#logout" },
    ];

    return { topItems, adminItems, clientItems, bottomItems };
  }, [isAdmin, isFuncionario, isLogged, newBoardOrdersCount]);

  if (!open) return null;

  const renderMenuItem = (item, indexKey) => {
    const Icon = item.icon;
    return (
      <a key={indexKey} href={item.href} className="menu-item" onClick={(e) => handleClick(item, e)}>
        <Icon />
        <span>{item.label}</span>
        {Number(item.badgeCount) > 0 ? (
          <span className="menu-item__badge" aria-label={`${item.badgeCount} novo(s) pedido(s)`}>
            {item.badgeCount}
          </span>
        ) : null}
      </a>
    );
  };

  const handleClick = (item, e) => {
    e.preventDefault();
    try {
      if (item.href === "#logout") {
        AuthAPI.logout();
        toast.success("Sessão encerrada.");
        onClose?.();
        navigate("/home");
        return;
      }
      if (item.href?.startsWith("#")) {
        const el = document.querySelector(item.href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        onClose?.();
        return;
      }
      if (item.href === "/board") {
        markBoardOrdersAsSeen();
      }
      navigate(item.href || "/");
      onClose?.();
    } catch (err) {
      console.error("SidebarAdm click error:", err);
      toast.error("Ops, algo deu errado no menu.");
    }
  };

  return (
    <>
      <div className="sidebar-user">
        <div className="sidebar-user__header">
          <span className="sidebar-user__title">{isFuncionario ? 'ADMIN' : 'MENU'}</span>
          <button className="sidebar-user__close" onClick={onClose}>✕</button>
        </div>

        <nav className="sidebar-user__nav">
          {isLogged ? (
            <>
              {menuSections.topItems.map((item, i) => renderMenuItem(item, `top-${i}`))}

              {menuSections.adminItems.length > 0 ? (
                <>
                  <div className="sidebar-user__section-divider" />
                  <p className="sidebar-user__section-label">Telas de administrador</p>
                  {menuSections.adminItems.map((item, i) => renderMenuItem(item, `admin-${i}`))}
                </>
              ) : null}

              <div className="sidebar-user__section-divider" />
              <p className="sidebar-user__section-label">Telas de cliente</p>
              {menuSections.clientItems.map((item, i) => renderMenuItem(item, `client-${i}`))}

              <div className="sidebar-user__section-divider" />
              {menuSections.bottomItems.map((item, i) => renderMenuItem(item, `bottom-${i}`))}
            </>
          ) : (
            menuSections.guestItems.map((item, i) => renderMenuItem(item, `guest-${i}`))
          )}
        </nav>

        <div className="sidebar-user__footer">
          <ThemeSwitcher />
          <p style={{ margin: "0.5rem 0" }}>Versão 1.0.0</p>
          <p style={{ margin: "0.5rem 0" }}>© {currentYear} - Basilios</p>
        </div>
      </div>

      <div className="sidebar-overlay" role="button" tabIndex={0} onClick={onClose} onKeyDown={(e) => e.key === "Enter" && onClose()} aria-label="Fechar menu" />
    </>
  );
}
