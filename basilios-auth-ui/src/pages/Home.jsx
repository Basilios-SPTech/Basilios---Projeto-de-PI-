// src/pages/Home.jsx - Página principal com listagem de produtos, integração com o carrinho e personalização de lanches
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Header from "../components/header.jsx";
import Cart from "../components/Cart.jsx";
import CustomizeBurger from "../components/CustomizeBurger.jsx";
import { listarProdutos } from "../services/produtosApi.js";
import { http } from "../services/http.js";
import FooterBasilios from "../components/FooterBasilios.jsx";

const CHAVE_STORAGE = "produtos-basilios";
const CHAVE_CART = "carrinho-basilios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Mini componente para descrição expansível
function ExpandableDesc({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      // Força o layout com display para calcular corretamente
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      setClamped(scrollHeight > clientHeight + 1);
    }
  }, [text]);

  // Força recalcular quando o estado de expansão muda
  useEffect(() => {
    const el = ref.current;
    if (el && expanded) {
      el.style.maxHeight = el.scrollHeight + 'px';
    } else if (el) {
      el.style.maxHeight = '';
    }
  }, [expanded]);

  return (
    <div className={`hp-card__desc-wrap${expanded ? " expanded" : ""}`}>
      <p 
        ref={ref} 
        className={`hp-card__desc`}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 2,
          WebkitBoxOrient: 'vertical',
          overflow: expanded ? 'visible' : 'hidden',
        }}
      >
        {text}
      </p>
      {clamped && (
        <button
          type="button"
          className="hp-card__desc-toggle"
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            setExpanded((v) => !v); 
          }}
          title={expanded ? "Mostrar menos" : "Mostrar mais"}
        >
          {expanded ? "ver menos" : "ver mais"}
          <svg className="hp-card__desc-chevron" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [cartCount, setCartCount] = useState(0);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [productToCustomize, setProductToCustomize] = useState(null);
  const [promoAtual, setPromoAtual] = useState(null);

  // 🔥 Buscar promoções ativas
  useEffect(() => {
    async function carregarPromocoes() {
      try {
        console.log("🔍 Buscando promoções do endpoint /promotions/current...");
        const response = await http.get("/promotions/current?page=0&size=100");
        const data = response.data || response;
        
        console.log("✅ Resposta bruta do servidor:", response);
        console.log("✅ Dados extraídos:", data);
        console.log("✅ Tipo de dados:", typeof data);
        console.log("✅ É array?:", Array.isArray(data));
        console.log("✅ Quantidade de items:", (data || []).length);

        // Extrair content da resposta paginada do Spring
        const promoList = Array.isArray(data) 
          ? data 
          : (data?.content || data?.data || []);
        console.log("✅ Lista final de promoções:", promoList);
        
        setPromocoes(promoList);
      } catch (err) {
        console.error("❌ Erro ao carregar promoções:");
        console.error("   - Mensagem:", err.message);
        console.error("   - Status:", err.response?.status);
        console.error("   - Dados da resposta:", err.response?.data);
        console.error("   - Config da request:", err.config);
        console.error("   - Erro completo:", err);
        setPromocoes([]);
      }
    }

    carregarPromocoes();
  }, []);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const data = await listarProdutos();

        console.log("✅ Produtos carregados da API:", data);

        const adaptados = (data || []).map((p, index) => {
          const rawPrice = p.price ?? p.preco ?? 0;
          const parsedPrice = parseFloat(
            String(rawPrice).replace(/[^\d.,-]/g, "").replace(",", ".")
          );

          return {
            index: p.id ?? index,
            nome: p.name ?? p.nome ?? "",
            descricao: p.description ?? p.descricao ?? "",
            preco: Number.isFinite(parsedPrice) ? parsedPrice : 0,
            categoria: p.category ?? p.categoria ?? "",
            subcategoria: p.subcategory ?? p.subcategoria ?? "",
            pausado: p.isPaused ?? p.paused ?? false,
            imagem: p.imageUrl ? `${API_BASE}${p.imageUrl}` : p.imagem || "",
          };
        });

        const ativos = adaptados.filter((p) => !p.pausado);

        setProdutos(ativos);

        // Notifica a SearchBar sobre os produtos disponíveis
        window.dispatchEvent(new CustomEvent("productsLoaded", { detail: ativos }));

        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(adaptados));
      } catch (err) {
        console.error("💥 Erro ao carregar produtos do backend:", err);

        try {
          const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || "[]");
          const ativos = (Array.isArray(salvo) ? salvo : []).filter(
            (p) => !p.pausado,
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

  // Destaca um card quando selecionado pela busca
  useEffect(() => {
    const handler = (e) => {
      const productId = e.detail;
      if (!productId) return;
      // Encontra o card pelo data-product-id
      const card = document.querySelector(`[data-product-id="${productId}"]`);
      if (card) {
        const headerOffset = 130;
        const y = card.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        card.classList.add("hp-card--highlight");
        setTimeout(() => card.classList.remove("hp-card--highlight"), 2000);
      }
    };
    window.addEventListener("highlightProduct", handler);
    return () => window.removeEventListener("highlightProduct", handler);
  }, []);

  const sanitizeImageUrl = (url) => {
    if (!url) return "/placeholder.jpg";

    // Bloqueia javascript: e data: URIs maliciosos
    if (url.startsWith("javascript:") || url.startsWith("data:text/html")) {
      return "/placeholder.jpg";
    }

    // Aceita apenas HTTP(S) ou caminhos relativos
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    ) {
      return url;
    }

    return "/placeholder.jpg";
  };

  const sanitizePrice = (price) => {
    // Remove tudo que não é número, ponto ou vírgula
    const limpo = String(price).replace(/[^\d.,]/g, "");

    // Converte para número
    const numero = parseFloat(limpo.replace(",", "."));

    // Valida se é número válido
    if (isNaN(numero) || numero < 0) {
      return "0,00";
    }

    return numero.toFixed(2).replace(".", ",");
  };

  const categorias = useMemo(() => {
    const set = new Set(["Todas"]);
    for (const p of produtos) {
      const c = (p.categoria || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set);
  }, [produtos]);

  // 🎯 Identifica produtos que estão em promoção ativa hoje
  const produtosEmPromocaoAtiva = useMemo(() => {
    const hoje = new Date();
    const idsEmPromo = new Set();
    
    console.log("📅 Data/hora atual:", hoje);
    
    for (const promo of promocoes) {
      console.log("🔎 Checando promoção:", promo.title, "isActive:", promo.isActive, "productId:", promo.productId);
      
      // Verifica se promoção está ativa e dentro do período
      if (promo.isActive) {
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        endDate.setHours(23, 59, 59, 999); // Inclui todo o dia final
        
        console.log("   startDate:", startDate, "endDate:", endDate);
        console.log("   hoje >= startDate?", hoje >= startDate, "| hoje <= endDate?", hoje <= endDate);
        
        if (hoje >= startDate && hoje <= endDate && promo.productId) {
          idsEmPromo.add(promo.productId);
          console.log("   ✅ ADICIONADO À PROMOÇÃO:", promo.productId);
        }
      }
    }
    console.log("📍 IDs em promoção final:", Array.from(idsEmPromo));
    return idsEmPromo;
  }, [promocoes]);

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return produtos.filter((p) => {
      const okCat = cat === "Todas" || (p.categoria || "").trim() == cat;
      const okTermo =
        !termo ||
        (p.nome || "").toLowerCase().includes(termo) ||
        (p.descricao || "").toLowerCase().includes(termo);
      // ❌ Exclui produtos que estão em promoção ativa
      const naoEmPromo = !produtosEmPromocaoAtiva.has(p.index);
      return okCat && okTermo && naoEmPromo;
    });
  }, [produtos, q, cat, produtosEmPromocaoAtiva]);

  const produtosOrdenados = useMemo(
    () => [...filtrados].sort((a, b) => Number(b.index) - Number(a.index)),
    [filtrados],
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
    Porções: [
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
      nameMap[key] = SECTION_PRODUCT_NAMES[key].map((n) =>
        (n || "").toLowerCase().trim(),
      );
    }

    const included = new Set();

    const sections = NAV_SECTION_ORDER.map((label) => {
      const names = nameMap[label] || [];
      const items = produtos.filter((p) => {
        const pn = (p.nome || "").toLowerCase().trim();
        // ❌ Exclui produtos que estão em promoção ativa
        const naoEmPromo = !produtosEmPromocaoAtiva.has(p.index);
        const matches = names.includes(pn) && naoEmPromo;
        
        if (pn.includes("combo x-salada")) {
          console.log(`🔍 Combo X-Salada: index=${p.index}, naoEmPromo=${naoEmPromo}, produtosEmPromocaoAtiva=${Array.from(produtosEmPromocaoAtiva)}, matches=${matches}`);
        }
        
        if (matches) {
          included.add(p.index);
          return true;
        }
        return false;
      });

      return [label, items];
    });

    return { sections, included };
  }, [produtos, produtosEmPromocaoAtiva]);

  // Escuta eventos de scroll disparados pelo Header para rolar até a seção
  useEffect(() => {
    const scrollToEl = (el) => {
      const headerOffset = 120;
      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    const handler = (e) => {
      const target = e?.detail;
      if (!target) return;

      const tryScroll = () => {
        const el = document.querySelector(`[data-section="${target}"]`);
        if (el) {
          scrollToEl(el);
          return true;
        }
        return false;
      };

      if (!tryScroll()) {
        setTimeout(() => tryScroll(), 350);
      }
    };

    window.addEventListener("scrollToSection", handler);

    try {
      const pending = sessionStorage.getItem("scrollToSection");
      if (pending) {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
          attempts += 1;
          const el = document.querySelector(`[data-section="${pending}"]`);

          if (el) {
            scrollToEl(el);
            clearInterval(interval);
            try {
              sessionStorage.removeItem("scrollToSection");
            } catch (e) {}
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
          }
        }, 200);
      }
    } catch (err) {
      /* ignore */
    }

    return () => window.removeEventListener("scrollToSection", handler);
  }, []);

  function addToCart(produto, customOptions = {}) {
    const carrinho = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
    const novo = Array.isArray(carrinho) ? carrinho : [];

    // A busca por existente deve ser mais robusta para itens não customizados, mas por enquanto, mantemos assim.
    // Para itens customizados, sempre criamos um novo.
    const existente = novo.find(
      (item) => item.id === produto.index && !item.isCustom,
    );

    if (customOptions.isCustom) {
      novo.push({
        id: produto.index + "-" + Date.now(), // ID único para item customizado
        originalProductId: produto.index, // ID do produto original
        nome: produto.nome,
        preco: Number(customOptions.price || produto.preco || "0"),
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

  function handleCustomize(produto, promoAtive = null) {
    // Se houver promoção ativa, ajusta o preço do produto antes de customizar
    const produtoComPreco = promoAtive 
      ? {
          ...produto,
          preco: Number(produto.preco || 0) - Number(promoAtive.discountAmount || 0)
        }
      : produto;
    
    setProductToCustomize(produtoComPreco);
    setPromoAtual(promoAtive);
    setIsCustomizing(true);
  }

  function handleSaveCustomization(customItem) {
    // O item customizado já contém o preço correto (com ou sem desconto)
    addToCart(productToCustomize, { isCustom: true, ...customItem });
    setIsCustomizing(false);
    setProductToCustomize(null);
    setPromoAtual(null);
  }

  function handleCloseCustomization() {
    setIsCustomizing(false);
    setProductToCustomize(null);
    setPromoAtual(null);
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
        {/* 🎉 SEÇÃO DE PROMOÇÕES */}
        {promocoes.length > 0 && (
          <div className="hp-section" data-section="promocoes">
            <h2 className="hp-section__title">🔥 Promoções</h2>
            <div className="hp-grid">
              {promocoes.map((promo) => {
                // Encontra o produto correspondente para exibir informações
                const produtoPromo = produtos.find(p => p.index === promo.productId);
                
                // Calcula o percentual de desconto dinamicamente
                const precoOriginal = produtoPromo?.preco ? parseFloat(String(produtoPromo.preco).replace(/[^\d.,-]/g, "").replace(",", ".")) : 0;
                const precoComDesconto = Math.max(
                  0,
                  (produtoPromo?.preco || 0) - (promo.discountAmount || 0)
                );
                const discountPercentage = precoOriginal > 0 && promo.discountAmount 
                  ? Math.round((promo.discountAmount / precoOriginal) * 100)
                  : promo.discountPercentage || 0;
                
                return (
                  <article
                    key={`promo-${promo.id}`}
                    data-product-id={produtoPromo?.index ?? `promo-${promo.id}`}
                    className="hp-card hp-card--promo"
                  >
                    <div className="hp-card__media">
                      {produtoPromo?.imagem ? (
                        <img
                          src={sanitizeImageUrl(produtoPromo.imagem)}
                          alt={produtoPromo.nome || "Promoção"}
                        />
                      ) : (
                        <div className="hp-card__placeholder">Sem imagem</div>
                      )}
                      {/* Badge de Promoção */}
                      <div className="hp-promo-badge">
                        {discountPercentage}% OFF
                      </div>
                    </div>

                    <div className="hp-card__body">
                      <h3 className="hp-card__title">{promo.title}</h3>
                      {produtoPromo?.descricao && (
                        <ExpandableDesc text={produtoPromo.descricao} />
                      )}
                    </div>

                    <div className="hp-card__footer hp-card__footer--promo">
                      <div className="hp-price hp-price--promo">
                        <div className="hp-price__old-wrap">
                          <span className="hp-price__label">De</span>
                          <strong className="hp-price__old-value">
                            R$ {sanitizePrice(produtoPromo?.preco || 0)}
                          </strong>
                        </div>
                        <div className="hp-price__new-wrap">
                          <span className="hp-price__label hp-price__label--new">Por</span>
                          <strong className="hp-price__new-value">
                            R$ {sanitizePrice(precoComDesconto)}
                          </strong>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary hp-add"
                        onClick={() => produtoPromo && handleCustomize(produtoPromo, promo)}
                      >
                        Adicionar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {cat === "Todas" ? (
          // Renderizamos primeiro as seções personalizadas mapeadas pela navbar
          (function () {
            const parts = [];

            // Seções customizadas (ordem definida em customSections)
            for (const [label, items] of customSections.sections) {
              parts.push(
                <div
                  key={label}
                  className="hp-section"
                  data-section={slug(label)}
                >
                  <h2 className="hp-section__title">{label}</h2>

                  {items.length === 0 ? (
                    <p className="hp-empty">
                      Nenhum item encontrado nesta seção.
                    </p>
                  ) : (
                    <div className="hp-grid">
                      {items.map((p) => (
                        <article key={p.index} data-product-id={p.index} className="hp-card">
                          <div className="hp-card__media">
                            {p.imagem ? (
                              <img
                                src={sanitizeImageUrl(p.imagem)}
                                alt={p.nome || "Produto"}
                              />
                            ) : (
                              <div className="hp-card__placeholder">
                                Sem imagem
                              </div>
                            )}
                          </div>

                          <div className="hp-card__body">
                            <h3 className="hp-card__title">{p.nome}</h3>
                            <ExpandableDesc text={p.descricao} />
                          </div>

                          <div className="hp-card__footer">
                            <div className="hp-price">
                              <span>R$</span>
                              <strong>{sanitizePrice(p.preco)}</strong>
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
                </div>,
              );
            }

            // Produtos restantes (não incluídos nas seções customizadas)
            const restantes = produtos.filter(
              (p) => !customSections.included.has(p.index) && !produtosEmPromocaoAtiva.has(p.index),
            );
            if (restantes.length > 0) {
              const map = new Map();
              for (const p of restantes) {
                const categoria = (p.categoria || "").trim() || "Sem categoria";
                if (!map.has(categoria)) map.set(categoria, []);
                map.get(categoria).push(p);
              }

              for (const [categoria, itens] of map.entries()) {
                parts.push(
                  <div
                    key={categoria}
                    className="hp-section"
                    data-section={slug(categoria)}
                  >
                    <h2 className="hp-section__title">{categoria}</h2>
                    <div className="hp-grid">
                      {itens.map((p) => (
                        <article key={p.index} data-product-id={p.index} className="hp-card">
                          <div className="hp-card__media">
                            {p.imagem ? (
                              <img src={sanitizeImageUrl(p.imagem)} alt={p.nome || "Produto"} />
                            ) : (
                              <div className="hp-card__placeholder">
                                Sem imagem
                              </div>
                            )}
                          </div>

                          <div className="hp-card__body">
                            <h3 className="hp-card__title">{p.nome}</h3>
                            <ExpandableDesc text={p.descricao} />
                          </div>

                          <div className="hp-card__footer">
                            <div className="hp-price">
                              <span>R$</span>
                              <strong>{sanitizePrice(p.preco)}</strong>
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
                  </div>,
                );
              }
            }

            if (parts.length === 0) {
              return (
                <p className="hp-empty">
                  Nada por aqui… Experimente limpar filtros ou cadastrar novos
                  itens.
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
              <article key={p.index} data-product-id={p.index} className="hp-card">
                <div className="hp-card__media">
                  {p.imagem ? (
                    <img src={sanitizeImageUrl(p.imagem)} alt={p.nome || "Produto"} />
                  ) : (
                    <div className="hp-card__placeholder">Sem imagem</div>
                  )}
                </div>

                <div className="hp-card__body">
                  <h3 className="hp-card__title">{p.nome}</h3>
                  <ExpandableDesc text={p.descricao} />
                </div>

                <div className="hp-card__footer">
                  <div className="hp-price">
                    <span>R$</span>
                    <strong>{sanitizePrice(p.preco)}</strong>
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
