/** Sider bar para users*/
import {Home, LayoutDashboard, PlusSquare, Settings, LogOut, ListOrdered } from "lucide-react";
import "../styles/side-bar.css";

export default function SidebarUser({ open, onClose }) {
  if (!open) return null;

  const menuItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: PlusSquare, label: "Cadastrar Produto", href: "/cadastro" },
    { icon: Settings, label: "Configurações", href: "/adm/config" },
    { icon: LogOut, label: "Sair", href: "/logout" },
  ];

  const handleClick = (item, e) => {
    e.preventDefault();
    // rola até seções quando for hash (#id)
    if (item.href?.startsWith("#")) {
      const el = document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      onClose?.();
      return;
    }
    // por enquanto, links "normais" seguem o href (vai recarregar se for fora do SPA)
    window.location.href = item.href || "/";
    onClose?.();
  };

  return (
    <>
      <div className="sidebar-user">
        {/* Cabeçalho */}
        <div className="sidebar-user__header">
          <span className="sidebar-user__title">MENU</span>
          <button className="sidebar-user__close" onClick={onClose}>✕</button>
        </div>

        {/* Navegação */}
        <nav className="sidebar-user__nav">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.href}
                className="menu-item"
                onClick={(e) => handleClick(item, e)}
              >
                <Icon />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Rodapé */}
        <div className="sidebar-user__footer">
          <p style={{ margin: "0.5rem 0" }}>Versão 1.0.0</p>
          <p style={{ margin: "0.5rem 0" }}>© 2025 - Basilios</p>
        </div>
      </div>

      {/* Overlay */}
      <div className="sidebar-overlay" onClick={onClose} />
    </>
  );
}
