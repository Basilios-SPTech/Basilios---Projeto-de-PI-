/** SidebarAdm */
import { Home, ListOrdered, LogOut, Package, Hamburger, LayoutDashboard, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../services/api";
import { authStorage } from "../services/storageAuth";
import "../styles/side-bar.css";

export default function SidebarAdm({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  let isLogged = false;
  try { isLogged = !!authStorage.getToken(); } catch { isLogged = false; }

  const items = isLogged
    ? [
        { icon: Home,     label: "Início",              href: "/home" },
        { icon: Package,  label: "Cadastrar Produto",   href: "/cadastro" },
        { icon: ListOrdered, label: "Pedidos (Board)",     href: "/board" },
        { icon: LayoutDashboard, label: "Dashboard",     href: "/dashboard" },
        { icon: Hamburger,label: "Sobre Nós",           href: "/about" },
        { icon: LogOut,   label: "Sair",                href: "#logout" },
      ]
    : [
        { icon: Home,     label: "Início",    href: "/home" },
        { icon: Hamburger,label: "Sobre Nós", href: "/about" },
        { icon: LogIn,    label: "Entrar",    href: "/login" },
      ];

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
          <span className="sidebar-user__title">ADMIN</span>
          <button className="sidebar-user__close" onClick={onClose}>✕</button>
        </div>

        <nav className="sidebar-user__nav">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <a key={i} href={item.href} className="menu-item" onClick={(e) => handleClick(item, e)}>
                <Icon />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-user__footer">
          <p style={{ margin: "0.5rem 0" }}>Versão 1.0.0</p>
          <p style={{ margin: "0.5rem 0" }}>© 2025 - Basilios</p>
        </div>
      </div>

      <div className="sidebar-overlay" onClick={onClose} />
    </>
  );
}
