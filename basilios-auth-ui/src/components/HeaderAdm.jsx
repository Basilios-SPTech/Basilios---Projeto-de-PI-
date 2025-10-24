// src/components/HeaderAdm.jsx  (o seu header atual com mínima mudança)
import { useState, useEffect } from "react";
import { Menu, User } from "lucide-react";
import SearchBar from "./SearchBar.jsx";
import SidebarAdm from "./SidebarAdm.jsx";
import SidebarUser from "./SidebarUser.jsx";
import "../styles/header.css"; 

export default function Header({ variant = "user", MenuComponent = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => setIsMenuOpen((s) => !s);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const nodes = document.querySelectorAll('section[data-section]');
      nodes.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) setActiveSection(index);
      });
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="header-grid">
          <button onClick={toggleMenu} className="icon-button" aria-label="Abrir menu">
            <Menu size={28} />
          </button>

          <div className="center-content">
            <div className="logo-container" style={{ "--logo-nudge-x": "130px" }}>
              <img src="/LogoApenasNomeEstilizada.png" alt="Basilios" className="logo-img logo-white-glow" />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginRight: "1rem", position: "relative", zIndex: 1 }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} width={250} />
            <button className="icon-button" aria-label="Usuário">
              <User size={28} />
            </button>
          </div>
        </div>

        {/* Linha inferior vazia por enquanto */}
        <div className="scroll-container">
          <div style={{ display: "flex", gap: "4rem", justifyContent: "center", minWidth: "max-content", paddingInline: "1rem" }} />
        </div>
      </header>

      {/* Sidebars plugáveis */}
      {MenuComponent ? (
        <MenuComponent open={isMenuOpen} onClose={toggleMenu} />
      ) : variant === "adm" ? (
        <SidebarAdm open={isMenuOpen} onClose={toggleMenu} />
      ) : (
        <SidebarUser open={isMenuOpen} onClose={toggleMenu} />
      )}
    </>
  );
}
