/** Header  */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, User } from "lucide-react";
import SearchBar from "./SearchBar.jsx";
import SidebarAdm from "./SidebarAdm.jsx";
import { authStorage } from "../services/storageAuth.js";
import "../styles/header.css";

function useAuthSnapshot() {
  // 🔻 SEM ROLES: guardamos só se está autenticado
  const [snap, setSnap] = useState(() => ({
    isAuthenticated: authStorage.isAuthenticated(),
  }));

  useEffect(() => {
    return authStorage.subscribe(() => {
      setSnap({
        isAuthenticated: authStorage.isAuthenticated(),
      });
    });
  }, []);

  return snap;
}

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthSnapshot();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = useCallback(() => setIsMenuOpen((s) => !s), []);

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

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const nodes = document.querySelectorAll("section[data-section]");
      let current = null;
      nodes.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) current = index;
      });
      if (current !== null) setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const location = useLocation();

  const goToSection = (label) => {
    const target = slug(label);

    // Save target in sessionStorage so Home can pick it up after navigation
    try {
      sessionStorage.setItem("scrollToSection", target);
    } catch (e) {
      /* ignore */
    }

    if (location.pathname !== "/home") {
      navigate("/home");
      return;
    }

    // If already on Home, dispatch event and also clear sessionStorage
    const ev = new CustomEvent("scrollToSection", { detail: target });
    window.dispatchEvent(ev);
    try {
      sessionStorage.removeItem("scrollToSection");
    } catch (e) {}
  };

  // 🔎 quando o usuário busca (Enter / clique na lupa)
  const handleSearchSubmit = () => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return;

    const match = sections.find((label) =>
      label.toLowerCase().includes(term)
    );

    if (match) {
      goToSection(match);
    } else {
      console.log("Nenhuma seção encontrada para:", term);
      // aqui depois você pode trocar por um toast bonitinho
    }
  };

  const handleUserClick = () => {
    // Direciona para a página de perfil (pública)
    navigate("/profile");
  };

  return (
    <>
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        {/* Linha superior */}
        <div className="header-grid">
          <button
            onClick={toggleMenu}
            className="icon-button"
            aria-label="Abrir menu"
          >
            <Menu size={28} />
          </button>

          <div className="center-content">
            <div
              className="logo-container"
              style={{ "--logo-nudge-x": "130px" }}
            >
              <img
                src="/LogoApenasNomeEstilizada.png"
                alt="Basilios"
                className="logo-img logo-white-glow"
              />
            </div>
          </div>

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
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit} // 👈 agora a busca funciona
              width={250}
            />
            <button
              className="icon-button"
              onClick={handleUserClick}
              aria-label="Área do usuário"
            >
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
                className={`section-link ${activeSection === i ? "active" : ""
                  }`}
                onClick={() => goToSection(label)}
                onKeyDown={(e) =>
                  e.key === "Enter" ? goToSection(label) : null
                }
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 🔻 SEM ROLES */}
      <SidebarAdm open={isMenuOpen} onClose={toggleMenu} />
    </>
  );
}
