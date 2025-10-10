import { useState, useEffect } from "react";
import { Menu, User } from "lucide-react";
import SearchBar from "./SearchBar.jsx";
import SidebarAdm from "./SidebarAdm.jsx";
import SidebarUser from "./SidebarUser.jsx";
import "../styles/header.css"; 

export default function Header({ variant = "user" }) {
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

  const sections = [
    "Combos Individuais","Lanches Premium","Beirutes","Hot-Dog","Veganos","Porções","Sobremesas","Bebidas",
  ];

  const slug = (s) => s.toString().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase();

  return (
    <>
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        {/* Linha superior */}
        <div className="header-grid">
          {/* esquerda: menu */}
          <button onClick={toggleMenu} className="icon-button">
            <Menu size={28} />
          </button>

          {/* centro: palco + logo absoluta */}
          <div className="center-content">
            <div
              className="logo-container"
              style={{ "--logo-nudge-x": "130px" }}   // empurra a logo p/ direita
            >
              <img
                src="/LogoApenasNomeEstilizada.png"
                alt="Basilios"
                className="logo-img logo-white-glow"
              />
            </div>
          </div>
            
          {/* direita: busca + usuário */}
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginRight: "1rem", position: "relative", zIndex: 1 }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} width={250} />
            <button className="icon-button">
              <User size={28} />
            </button>
          </div>
        </div>

        {/* Linha inferior: seções */}
        <div className="scroll-container">
          <div style={{ display: "flex", gap: "4rem", justifyContent: "center", minWidth: "max-content", paddingInline: "1rem" }}>
            {sections.map((label, i) => (
              <span
                key={i}
                className={`section-link ${activeSection === i ? "active" : ""}`}
                onClick={() => {
                  const el = document.querySelector(`section[data-section="${slug(label)}"]`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Sidebars plugáveis */}
      {variant === "adm" ? (
        <SidebarAdm open={isMenuOpen} onClose={toggleMenu} />
      ) : (
        <SidebarUser open={isMenuOpen} onClose={toggleMenu} />
      )}
    </>
  );
}
