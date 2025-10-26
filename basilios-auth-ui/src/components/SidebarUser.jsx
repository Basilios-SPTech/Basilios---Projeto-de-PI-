/** SidebarUser — mostra "Entrar" quando sem token e "Sair" quando com token */
import { Home, ShoppingBag, LogOut, Package, Hamburger, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../services/api";             // <-- você tem /services/api.js
import { authStorage } from "../services/storageAuth"; // <-- você tem /services/storageAuth.js
import "../styles/side-bar.css";

export default function SidebarUser({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  let isLogged = false;
  try { isLogged = !!authStorage.getToken(); } catch { isLogged = false; }

  const items = isLogged
    ? [
        { icon: Home,       label: "Início",         href: "/home" },
        { icon: ShoppingBag,label: "Meus Pedidos",   href: "#pedidos" },
        { icon: Package,    label: "Meus Endereços", href: "#enderecos" },
        { icon: Hamburger,  label: "Sobre Nós",      href: "/about" },
        { icon: LogOut,     label: "Sair",           href: "#logout" },
      ]
    : [
        { icon: Home,      label: "Início",    href: "/home" },
        { icon: Hamburger, label: "Sobre Nós", href: "/about" },
        { icon: LogIn,     label: "Entrar",    href: "/login" },
      ];

  const handleClick = (item, e) => {
    e.preventDefault();
    try {
      if (item.href === "#logout") {
        AuthAPI.logout(); // limpa token
        toast.success("Você saiu da sua conta.");
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
      // rota SPA
      navigate(item.href || "/");
      onClose?.();
    } catch (err) {
      console.error("SidebarUser click error:", err);
      toast.error("Ops, algo deu errado no menu.");
    }
  };

  return (
    <>
      <div className="sidebar-user">
        <div className="sidebar-user__header">
          <span className="sidebar-user__title">MENU</span>
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
