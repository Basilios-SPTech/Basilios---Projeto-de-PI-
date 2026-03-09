/** Barra de pesquisa com dropdown de resultados */

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, FolderOpen, ShoppingBag, X } from "lucide-react";

// ── helpers ──
const normalize = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const slug = (s) => normalize(s).replace(/\s+/g, "-");

function HighlightText({ text, term }) {
  if (!term) return text;
  const idx = normalize(text).indexOf(normalize(term));
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + term.length);
  const after = text.slice(idx + term.length);
  return (
    <>
      {before}
      <mark className="search-highlight">{match}</mark>
      {after}
    </>
  );
}

// ── sections da navbar (espelhado do header) ──
const NAV_SECTIONS = [
  "Combos Individuais",
  "Lanches Premium",
  "Beirutes",
  "Hot-Dog",
  "Veganos",
  "Porções",
  "Sobremesas",
  "Bebidas",
];

export default function SearchBar({ width = 250 }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Escuta produtos carregados pela Home
  useEffect(() => {
    const handler = (e) => {
      if (Array.isArray(e.detail)) setProducts(e.detail);
    };
    window.addEventListener("productsLoaded", handler);
    return () => window.removeEventListener("productsLoaded", handler);
  }, []);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // ── Filtragem ──
  const term = query.trim();
  const termNorm = normalize(term);

  const matchedSections =
    termNorm.length >= 2
      ? NAV_SECTIONS.filter((s) => normalize(s).includes(termNorm))
      : [];

  const matchedProducts =
    termNorm.length >= 2
      ? products
          .filter(
            (p) =>
              normalize(p.nome).includes(termNorm) ||
              normalize(p.descricao).includes(termNorm) ||
              normalize(p.categoria).includes(termNorm)
          )
          .slice(0, 6)
      : [];

  const allResults = [
    ...matchedSections.map((s) => ({ type: "section", label: s })),
    ...matchedProducts.map((p) => ({ type: "product", data: p })),
  ];
  const totalResults = allResults.length;

  // ── Ações ──
  const goToSection = useCallback((label) => {
    const target = slug(label);
    try { sessionStorage.setItem("scrollToSection", target); } catch {}

    if (window.location.pathname !== "/home") {
      window.dispatchEvent(new CustomEvent("searchNavigate", { detail: "/home" }));
    }

    window.dispatchEvent(new CustomEvent("scrollToSection", { detail: target }));
    try { sessionStorage.removeItem("scrollToSection"); } catch {}

    setQuery("");
    setOpen(false);
  }, []);

  const goToProduct = useCallback((product) => {
    // Navega pra /home se não estiver lá
    if (window.location.pathname !== "/home") {
      window.dispatchEvent(new CustomEvent("searchNavigate", { detail: "/home" }));
    }

    setQuery("");
    setOpen(false);

    // Scrola direto até o card do produto (sem scroll duplo via seção)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("highlightProduct", { detail: product.index }));
    }, 300);
  }, []);

  const selectResult = useCallback((idx) => {
    const item = allResults[idx];
    if (!item) return;
    if (item.type === "section") goToSection(item.label);
    else goToProduct(item.data);
  }, [allResults, goToSection, goToProduct]);

  // ── Keyboard ──
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!open || totalResults === 0) {
      if (e.key === "Enter" && termNorm) {
        e.preventDefault();
        const match = NAV_SECTIONS.find((s) => normalize(s).includes(termNorm));
        if (match) goToSection(match);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % totalResults);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev <= 0 ? totalResults - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectResult(activeIdx >= 0 ? activeIdx : 0);
    }
  };

  const handleChange = (val) => {
    setQuery(val);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOpen(val.trim().length >= 2);
    }, 150);
  };

  const clearSearch = () => {
    setQuery("");
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const showDropdown = open && termNorm.length >= 2;

  return (
    <div className="search-wrapper" ref={containerRef} style={{ width }}>
      <div className="search-box">
        <Search className="search-icon" size={18} onClick={() => totalResults > 0 && selectResult(0)} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => termNorm.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        {query && (
          <button className="search-clear" onClick={clearSearch} aria-label="Limpar busca">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {totalResults === 0 ? (
            <div className="search-empty">Nenhum resultado para "{term}"</div>
          ) : (
            <>
              {matchedSections.length > 0 && (
                <div className="search-group">
                  <div className="search-group-label">Categorias</div>
                  {matchedSections.map((label, i) => (
                    <button
                      key={label}
                      className={`search-result ${activeIdx === i ? "search-result--active" : ""}`}
                      onClick={() => goToSection(label)}
                      onMouseEnter={() => setActiveIdx(i)}
                    >
                      <FolderOpen size={16} className="search-result-icon" />
                      <span><HighlightText text={label} term={term} /></span>
                    </button>
                  ))}
                </div>
              )}

              {matchedProducts.length > 0 && (
                <div className="search-group">
                  <div className="search-group-label">Produtos</div>
                  {matchedProducts.map((p, i) => {
                    const idx = matchedSections.length + i;
                    return (
                      <button
                        key={p.index}
                        className={`search-result ${activeIdx === idx ? "search-result--active" : ""}`}
                        onClick={() => goToProduct(p)}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        {p.imagem ? (
                          <img src={p.imagem} alt="" className="search-result-thumb" />
                        ) : (
                          <ShoppingBag size={16} className="search-result-icon" />
                        )}
                        <div className="search-result-info">
                          <span className="search-result-name">
                            <HighlightText text={p.nome} term={term} />
                          </span>
                          <span className="search-result-price">
                            R$ {Number(p.preco || 0).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
