// src/pages/Home.jsx 
import { useEffect, useMemo, useState } from "react";
import Header from "../components/header.jsx";
import Cart from "../components/Cart.jsx";
import CustomizeBurger from "../components/CustomizeBurger.jsx";
import { listarProdutos } from "../services/produtosApi.js";
import FooterBasilios from "../components/FooterBasilios.jsx";

const CHAVE_STORAGE = "produtos-basilios";
const CHAVE_CART = "carrinho-basilios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Home( ) {
  const [produtos, setProdutos] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [cartCount, setCartCount] = useState(0);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [productToCustomize, setProductToCustomize] = useState(null);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const data = await listarProdutos();

        console.log("✅ Produtos carregados da API:", data);

        const adaptados = (data || []).map((p, index) => ({
          index: p.id ?? index,
          nome: p.name ?? p.nome ?? "",
          descricao: p.description ?? p.descricao ?? "",
          preco: p.finalPrice ?? p.price ?? p.preco ?? 0,
          categoria: p.category ?? p.categoria ?? "",
          subcategoria: p.subcategory ?? p.subcategoria ?? "",
          pausado: p.isPaused ?? p.paused ?? false,
          imagem: p.imageUrl
            ? `${API_BASE}${p.imageUrl}` 
            : p.imagem || "",        
        }));

        const ativos = adaptados.filter((p) => !p.pausado);

        setProdutos(ativos);

        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(adaptados));
      } catch (err) {
        console.error("💥 Erro ao carregar produtos do backend:", err);

        try {
          const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || "[]");
          const ativos = (Array.isArray(salvo) ? salvo : []).filter(
            (p) => !p.pausado
          );
          setProdutos(ativos);
        } catch {
          setProdutos([]);
        }
      }
    }

    carregarProdutos();
  }, []);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
    setCartCount(Array.isArray(c) ? c.length : 0);
  }, []);

  const categorias = useMemo(() => {
    const set = new Set(["Todas"]);
    for (const p of produtos) {
      const c = (p.categoria || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set);
  }, [produtos]);

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return produtos.filter((p) => {
      const okCat =
        cat === "Todas" || (p.categoria || "").trim() == cat;
      const okTermo =
        !termo ||
        (p.nome || "").toLowerCase().includes(termo) ||
        (p.descricao || "").toLowerCase().includes(termo);
      return okCat && okTermo;
    });
  }, [produtos, q, cat]);

  const produtosOrdenados = useMemo(
    () => [...filtrados].sort((a, b) => Number(b.index) - Number(a.index)),
    [filtrados]
  );

  const secoesPorCategoria = useMemo(() => {
    const map = new Map();
    for (const p of produtosOrdenados) {
      const categoria = (p.categoria || "").trim() || "Sem categoria";
      if (!map.has(categoria)) map.set(categoria, []);
      map.get(categoria).push(p);
    }
    return Array.from(map.entries());
  }, [produtosOrdenados]);

  // Integração com a navbar: mapear seções fixas para produtos por nome
  const slug = (s) =>
    s
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

  const NAV_SECTION_ORDER = [
    "Combos Individuais",
    "Lanches Premium",
    "Beirutes",
    "Hot-Dog",
    "Porções",
  ];

  const SECTION_PRODUCT_NAMES = {
    "Combos Individuais": ["Combo X-Bacon Salada", "Combo X-Salada"],
    "Lanches Premium": [
      "Glicério",
      "Vila Monumento",
      "Basilios",
      "Cambuci",
      "Paraiso",
      "Vila Mariana",
      "Klabin",
    ],
    Beirutes: [
      "Beirute médio (Filé Mignon)",
      "Beirute Grande (Frango)",
      "Beirute médio (Frango)",
      "Beirute Grande (Filé Mignon)",
    ],
    "Hot-Dog": ["Dog Premium", "Dog Maionese Batata Palha"],
    "Porções": [
      "Batata Frita",
      "Batata Crinkle",
      "Batata Frita c/ Cheddar e Bacon",
      "Onion Rings",
      "Batata Canoa",
    ],
  };

  const customSections = useMemo(() => {
    const nameMap = {};
    // normalize names to lowercase for comparison
    for (const key of Object.keys(SECTION_PRODUCT_NAMES)) {
      nameMap[key] = SECTION_PRODUCT_NAMES[key].map((n) => (n || "").toLowerCase().trim());
    }

    const included = new Set();

    const sections = NAV_SECTION_ORDER.map((label) => {
      const names = nameMap[label] || [];
      const items = produtos.filter((p) => {
        const pn = (p.nome || "").toLowerCase().trim();
        if (names.includes(pn)) {
          included.add(p.index);
          return true;
        }
        return false;
      });

      return [label, items];
    });

    return { sections, included };
  }, [produtos]);

  // Escuta eventos de scroll disparados pelo Header para rolar até a seção
  useEffect(() => {
    const handler = (e) => {
      const target = e?.detail;
      if (!target) return;

      const tryScroll = () => {
        const el = document.querySelector(`[data-section="${target}"]`);
        if (el) {
          console.log("Home: scrolling to", target);
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        }
        return false;
      };

      if (!tryScroll()) {
        // retry shortly in case Home is still rendering
        setTimeout(() => tryScroll(), 350);
      }
    };

    window.addEventListener("scrollToSection", handler);

    // also try to read sessionStorage on mount (in case header navigated to / and set it)
    try {
      const pending = sessionStorage.getItem("scrollToSection");
      if (pending) {
        console.log("Home: found pending scrollToSection ->", pending);

        // Polling attempts for up to ~2 seconds (10 attempts)
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
          attempts += 1;
          const el = document.querySelector(`[data-section="${pending}"]`);

          if (el) {
            console.log("Home: polling found element, scrolling ->", pending);
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            clearInterval(interval);
            try {
              sessionStorage.removeItem("scrollToSection");
            } catch (e) {}
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.warn("Home: could not find section after polling:", pending);
          }
        }, 200);
      }
    } catch (err) {
      console.warn("Home: sessionStorage read failed", err);
    }

    return () => window.removeEventListener("scrollToSection", handler);
  }, []);

  function addToCart(produto, customOptions = {}) {
    const carrinho = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
    const novo = Array.isArray(carrinho) ? carrinho : [];

    // A busca por existente deve ser mais robusta para itens não customizados, mas por enquanto, mantemos assim.
    // Para itens customizados, sempre criamos um novo.
    const existente = novo.find((item) => item.id === produto.index && !item.isCustom);

    if (customOptions.isCustom) {
      novo.push({
        id: produto.index + "-" + Date.now(), // ID único para item customizado
        originalProductId: produto.index, // ID do produto original
        nome: produto.nome,
        preco: Number(produto.preco || "0"),
        qtd: 1,
        imagem: produto.imagem || "",
        categoria: produto.categoria || "",
        descricao: produto.descricao || "",
        isCustom: true,
        ...customOptions, // Espalha as opções de customização (incluindo observação e adições)
      });
    } else if (existente) {
      existente.qtd += 1;
    } else {
      novo.push({
        id: produto.index,
        originalProductId: produto.index, // ID do produto original
        nome: produto.nome,
        preco: Number(produto.preco || "0"),
        qtd: 1,
        imagem: produto.imagem || "",
        categoria: produto.categoria || "",
        descricao: produto.descricao || "",
        isCustom: false,
        // Adiciona campos vazios para consistência com itens customizados
        meatPoint: null,
        ingredients: [],
        drinks: [],
        breads: [],
        sauces: [],
        observation: "",
      });
    }

    localStorage.setItem(CHAVE_CART, JSON.stringify(novo));
    setCartCount(novo.reduce((acc, i) => acc + i.qtd, 0));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function handleCustomize(produto) {
    setProductToCustomize(produto);
    setIsCustomizing(true);
  }

  function handleSaveCustomization(customItem) {
    // O item customizado já contém o produto original e as opções de customização
    addToCart(productToCustomize, { isCustom: true, ...customItem });
    setIsCustomizing(false);
    setProductToCustomize(null);
  }

  function handleCloseCustomization() {
    setIsCustomizing(false);
    setProductToCustomize(null);
  }

  return (
    <div className="home-page page-with-fixed-header">
      <Header />
      <Cart />
      {isCustomizing && productToCustomize && (
        <CustomizeBurger
          item={productToCustomize}
          onClose={handleCloseCustomization}
          onSave={handleSaveCustomization}
        />
      )}
      <section className="hp-grid-wrap">
        {cat === "Todas" ? (
          // Renderizamos primeiro as seções personalizadas mapeadas pela navbar
          (function () {
            const parts = [];

            // Seções customizadas (ordem definida em customSections)
            for (const [label, items] of customSections.sections) {
              parts.push(
                <div key={label} className="hp-section" data-section={slug(label)}>
                  <h2 className="hp-section__title">{label}</h2>

                  {items.length === 0 ? (
                    <p className="hp-empty">Nenhum item encontrado nesta seção.</p>
                  ) : (
                    <div className="hp-grid">
                      {items.map((p) => (
                        <article key={p.index} className="hp-card">
                          <div className="hp-card__media">
                            {p.imagem ? (
                              <img src={p.imagem} alt={p.nome || "Produto"} />
                            ) : (
                              <div className="hp-card__placeholder">Sem imagem</div>
                            )}
                          </div>

                          <div className="hp-card__body">
                            <h3 className="hp-card__title">{p.nome}</h3>
                            <p className="hp-card__desc">{p.descricao}</p>
                          </div>

                          <div className="hp-card__footer">
                            <div className="hp-price">
                              <span>R$</span>
                              <strong>
                                {Number(p.preco || "0")
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </strong>
                            </div>
                            <button
                              className="btn btn-primary hp-add"
                              onClick={() => handleCustomize(p)}
                            >
                              Adicionar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Produtos restantes (não incluídos nas seções customizadas)
            const restantes = produtos.filter((p) => !customSections.included.has(p.index));
            if (restantes.length > 0) {
              const map = new Map();
              for (const p of restantes) {
                const categoria = (p.categoria || "").trim() || "Sem categoria";
                if (!map.has(categoria)) map.set(categoria, []);
                map.get(categoria).push(p);
              }

              for (const [categoria, itens] of map.entries()) {
                parts.push(
                  <div key={categoria} className="hp-section" data-section={slug(categoria)}>
                    <h2 className="hp-section__title">{categoria}</h2>
                    <div className="hp-grid">
                      {itens.map((p) => (
                        <article key={p.index} className="hp-card">
                          <div className="hp-card__media">
                            {p.imagem ? (
                              <img src={p.imagem} alt={p.nome || "Produto"} />
                            ) : (
                              <div className="hp-card__placeholder">Sem imagem</div>
                            )}
                          </div>

                          <div className="hp-card__body">
                            <h3 className="hp-card__title">{p.nome}</h3>
                            <p className="hp-card__desc">{p.descricao}</p>
                          </div>

                          <div className="hp-card__footer">
                            <div className="hp-price">
                              <span>R$</span>
                              <strong>
                                {Number(p.preco || "0")
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </strong>
                            </div>
                            <button
                              className="btn btn-primary hp-add"
                              onClick={() => handleCustomize(p)}
                            >
                              Adicionar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              }
            }

            if (parts.length === 0) {
              return (
                <p className="hp-empty">
                  Nada por aqui… Experimente limpar filtros ou cadastrar novos itens.
                </p>
              );
            }

            return parts;
          })()
        ) : filtrados.length === 0 ? (
          <p className="hp-empty">
            Nada por aqui… Experimente limpar filtros ou cadastrar novos itens.
          </p>
        ) : (
          <div className="hp-grid">
            {produtosOrdenados.map((p) => (
              <article key={p.index} className="hp-card">
                <div className="hp-card__media">
                  {p.imagem ? (
                    <img src={p.imagem} alt={p.nome || "Produto"} />
                  ) : (
                    <div className="hp-card__placeholder">Sem imagem</div>
                  )}
                </div>

                <div className="hp-card__body">
                  <h3 className="hp-card__title">{p.nome}</h3>
                  <p className="hp-card__desc">{p.descricao}</p>
                </div>

                <div className="hp-card__footer">
                  <div className="hp-price">
                    <span>R$</span>
                    <strong>
                      {Number(p.preco || "0")
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>
                  </div>
                  <button
                    className="btn btn-primary hp-add"
                    onClick={() => handleCustomize(p)}
                  >
                    Adicionar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
    
    
  );
}
