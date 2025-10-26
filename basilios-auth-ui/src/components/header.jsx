/** Header  */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User } from "lucide-react";
import SearchBar from "./SearchBar.jsx";
import SidebarAdm from "./SidebarAdm.jsx";
import SidebarUser from "./SidebarUser.jsx";
import { authStorage } from "../services/storageAuth.js";
import "../styles/header.css";


function useAuthSnapshot() {
  const [snap, setSnap] = useState(() => ({
    isAuthenticated: authStorage.isAuthenticated(),
    isAdmin: authStorage.isAdmin(),
  }));

  useEffect(() => {
    return authStorage.subscribe(() => {
      setSnap({
        isAuthenticated: authStorage.isAuthenticated(),
        isAdmin: authStorage.isAdmin(),
      });
    });
  }, []);

  return snap;
}

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuthSnapshot();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = useCallback(() => setIsMenuOpen((s) => !s), []);

  // Seções e util de slug
  const sections = useMemo(
    () => [
      "Combos Individuais",
      "Lanches Premium",
      "Beirutes",
      "Hot-Dog",
      "Veganos",
      "Porções",
      "Sobremesas",
      "Bebidas",
    ],
    []
  );

  const slug = useCallback(
    (s) =>
      s
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase(),
    []
  );

  // Um único listener de scroll para isScrolled + activeSection
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const nodes = document.querySelectorAll('section[data-section]');
      let current = null;
      nodes.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) current = index;
      });
      if (current !== null) setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // inicial
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fechar sidebar no ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goToSection = (label) => {
    const el = document.querySelector(`section[data-section="${slug(label)}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleUserClick = () => {
    if (!isAuthenticated) return navigate("/login");
    // autenticado: manda pra área mais útil
    if (isAdmin) navigate("/board");
    else navigate("/home");
  };

  return (
    <>
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        {/* Linha superior */}
        <div className="header-grid">
          {/* esquerda: menu */}
          <button onClick={toggleMenu} className="icon-button" aria-label="Abrir menu">
            <Menu size={28} />
          </button>

          {/* centro: palco + logo absoluta */}
          <div className="center-content">
            <div
              className="logo-container"
              style={{ "--logo-nudge-x": "130px" }} // ajuste fino da logo
            >
              <img
                src="/LogoApenasNomeEstilizada.png"
                alt="Basilios"
                className="logo-img logo-white-glow"
              />
            </div>
          </div>

          {/* direita: busca + usuário */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".75rem",
              marginRight: "1rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <SearchBar value={searchQuery} onChange={setSearchQuery} width={250} />
            <button className="icon-button" onClick={handleUserClick} aria-label="Área do usuário">
              <User size={28} />
            </button>
          </div>
        </div>

        {/* Linha inferior: seções */}
        <div className="scroll-container">
          <div
            style={{
              display: "flex",
              gap: "4rem",
              justifyContent: "center",
              minWidth: "max-content",
              paddingInline: "1rem",
            }}
          >
            {sections.map((label, i) => (
              <span
                key={label}
                role="button"
                tabIndex={0}
                className={`section-link ${activeSection === i ? "active" : ""}`}
                onClick={() => goToSection(label)}
                onKeyDown={(e) => (e.key === "Enter" ? goToSection(label) : null)}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Sidebars plugáveis por role */}
      {isAdmin ? (
        <SidebarAdm open={isMenuOpen} onClose={toggleMenu} />
      ) : (
        <SidebarUser open={isMenuOpen} onClose={toggleMenu} />
      )}
    </>
  );
}
