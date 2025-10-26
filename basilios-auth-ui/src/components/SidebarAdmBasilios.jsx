/** Sidebar ADM  */
import { Home, LayoutDashboard, PlusSquare, Settings, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../services/api";             
import { authStorage } from "../services/storageAuth"; 
import "../styles/side-bar.css";

export default function SidebarAdm({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;


  const isLogged = !!authStorage.getToken();

  const menuItems = isLogged
    ? [
        { icon: Home,            label: "Home",               href: "/home" },
        { icon: LayoutDashboard, label: "Dashboard",          href: "/board" },     
        { icon: PlusSquare,      label: "Cadastrar Produto",  href: "/cadastro" },
        { icon: Settings,        label: "Configurações",      href: "/adm/config" },
        { icon: LogOut,          label: "Sair",               href: "#logout" },    
      ]
    : [
        { icon: Home,   label: "Home",   href: "/home" },
        { icon: LogIn,  label: "Entrar", href: "/login" },                           
      ];

  const handleClick = (item, e) => {
    e.preventDefault();

    // Logout: limpa token e volta pra home
    if (item.href === "#logout") {
      AuthAPI.logout();                 // limpa localStorage
      toast.success("Sessão encerrada.");
      onClose?.();
      navigate("/home");
      return;
    }

    // Hash interna (#...): rola até a seção
    if (item.href?.startsWith("#")) {
      const el = document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      onClose?.();
      return;
    }

    // Navegação SPA
    navigate(item.href || "/");
    onClose?.();
  };

  return (
    <>
      <div className="sidebar-user">
        {/* Cabeçalho */}
        <div className="sidebar-user__header">
          <span className="sidebar-user__title">ADMIN</span>
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
