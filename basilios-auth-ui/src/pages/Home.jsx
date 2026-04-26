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
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
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
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [tamanho, setTamanho] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const catalogoRef = useRef(null);

  const ORDEM_CATEGORIAS = [
    "Combos Individuais",
    "Lanches Premium",
    "Burguer",
    "Porções",
    "Hot-Dog",
    "Beirutes",
  ];

  function normalizarCategoria(cat, nome) {
    const c = (cat || "").toLowerCase();
    const n = (nome || "").toLowerCase();

    // Combos
    if (n.includes("combo")) return "Combos Individuais";

    // Premium (nomes específicos que você mostrou)
    if (
      n.includes("klabin") ||
      n.includes("vila mariana") ||
      n.includes("paraiso") ||
      n.includes("cambuci") ||
      n.includes("basilios") ||
      n.includes("vila monumento") ||
      n.includes("glicério")
    ) return "Lanches Premium";

    // Burguer 
    if (n.includes("burger") || n.includes("x-")) return "Burguer";

    // Hot Dog
    if (n.includes("dog") ||
      n.includes("Dog Maionese Batata Palha")) return "Hot-Dog";

    // Porções
    if (
      n.includes("batata") ||
      n.includes("onion")
    ) return "Porções";

    // Beirutes
    if (n.includes("beirute")) return "Beirutes";

    return "Outros";
  }

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
      setIsLoading(true);
      try {
        // Sempre carrega TODOS os produtos (página 0, tamanho grande)
        const response = await listarProdutos(true, 0, 1000);

        console.log("✅ Resposta da API:", response);

        // Extrai o conteúdo da resposta paginada
        const produtosData = response.content || [];

        const adaptados = (produtosData || []).map((p, index) => {
          const rawPrice = p.price ?? p.preco ?? 0;
          const parsedPrice = parseFloat(
            String(rawPrice).replace(/[^\d.,-]/g, "").replace(",", ".")
          );

          return {
            index: p.id ?? index,
            nome: p.name ?? p.nome ?? "",
            descricao: p.description ?? p.descricao ?? "",
            preco: Number.isFinite(parsedPrice) ? parsedPrice : 0,
            categoria: normalizarCategoria(
              p.category ?? p.categoria,
              p.name ?? p.nome
            ),
            subcategoria: p.subcategory ?? p.subcategoria ?? "",
            pausado: p.isPaused ?? p.paused ?? false,
            imagem: p.imageUrl ? `${API_BASE}${p.imageUrl}` : p.imagem || "",
          };
        });

        const ativos = adaptados.filter((p) => !p.pausado);

        setProdutos(ativos);
        console.log("CATEGORIAS NORMALIZADAS:");
        ativos.forEach(p => console.log(p.nome, "→", p.categoria));

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
      } finally {
        setIsLoading(false);
      }
    }

    carregarProdutos();
  }, []);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
    setCartCount(Array.isArray(c) ? c.length : 0);
  }, []);

  // 🎯 Identifica produtos que estão em promoção ativa hoje
  const produtosEmPromocaoAtiva = useMemo(() => {
    const hoje = new Date();
    const idsEmPromo = new Set();

    for (const promo of promocoes) {
      if (promo.isActive) {
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        endDate.setHours(23, 59, 59, 999);

        if (hoje >= startDate && hoje <= endDate && promo.productId) {
          idsEmPromo.add(promo.productId);
        }
      }
    }
    return idsEmPromo;
  }, [promocoes]);

  // Ordena produtos por categoria e depois por ID
  const produtosOrdenadosPorCategoria = useMemo(() => {
    // Aplica filtros de categoria e busca
    const termo = q.trim().toLowerCase();
    let filtrados = produtos.filter((p) => {
      const okCat = cat === "Todas" || (p.categoria || "").trim() === cat;
      const okTermo =
        !termo ||
        (p.nome || "").toLowerCase().includes(termo) ||
        (p.descricao || "").toLowerCase().includes(termo);
      const naoEmPromo = !produtosEmPromocaoAtiva.has(p.index);
      return okCat && okTermo && naoEmPromo;
    });

    // Ordena por categoria
    return filtrados.sort((a, b) => {
      const catA = (a.categoria || "").trim();
      const catB = (b.categoria || "").trim();

      const indexA = ORDEM_CATEGORIAS.indexOf(catA);
      const indexB = ORDEM_CATEGORIAS.indexOf(catB);

      // Se categoria está na ordem, usa o índice. Senão, coloca no final
      const orderA = indexA === -1 ? 999 : indexA;
      const orderB = indexB === -1 ? 999 : indexB;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Se mesma categoria, ordena por ID crescente
      return Number(a.index) - Number(b.index);
    });
  }, [produtos, q, cat, produtosEmPromocaoAtiva]);

  // Calcula paginação baseada na lista linear
  const produtosPaginados = useMemo(() => {
    const inicio = paginaAtual * tamanho;
    const fim = inicio + tamanho;
    return produtosOrdenadosPorCategoria.slice(inicio, fim);
  }, [produtosOrdenadosPorCategoria, paginaAtual, tamanho]);

  const produtosAgrupados = useMemo(() => {
    const grupos = {};

    for (const produto of produtosPaginados) {
      const categoria = produto.categoria || "Outros";

      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }

      grupos[categoria].push(produto);
    }

    return grupos;
  }, [produtosPaginados]);

  // Recalcula total de páginas
  useEffect(() => {
    const total = Math.ceil(produtosOrdenadosPorCategoria.length / tamanho);
    setTotalPaginas(Math.max(1, total));
  }, [produtosOrdenadosPorCategoria, tamanho]);

  // Reseta para página 0 quando muda de filtro
  useEffect(() => {
    setPaginaAtual(0);
  }, [q, cat]);

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

  const scrollToCatalogTop = useCallback(() => {
    const headerOffset = 120;
    const top = catalogoRef.current
      ? catalogoRef.current.getBoundingClientRect().top + window.scrollY - headerOffset
      : 0;

    const root = document.documentElement;
    const body = document.body;
    const prevRootBehavior = root.style.scrollBehavior;
    const prevBodyBehavior = body.style.scrollBehavior;

    // Forca salto instantaneo para evitar animacao de baixo para cima.
    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    window.scrollTo(0, Math.max(0, top));
    root.style.scrollBehavior = prevRootBehavior;
    body.style.scrollBehavior = prevBodyBehavior;
  }, []);

  const changePagina = useCallback((nextOrUpdater) => {
    setPaginaAtual((prev) => {
      const next =
        typeof nextOrUpdater === "function"
          ? nextOrUpdater(prev)
          : nextOrUpdater;

      if (next === prev) return prev;

      scrollToCatalogTop();
      return next;
    });
  }, [scrollToCatalogTop]);

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
      <section ref={catalogoRef} className="hp-grid-wrap">
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

        {produtosPaginados.length > 0 ? (
          ORDEM_CATEGORIAS
            .filter((categoria) => produtosAgrupados[categoria])
            .map((categoria) => (
              <div key={categoria} className="hp-section">
                <h2 className="hp-section__title">{categoria}</h2>

                <div className="hp-grid">
                  {produtosAgrupados[categoria].map((p) => (
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
              </div>
            ))
        ) : (
          <p className="hp-empty">
            Nada por aqui… Experimente limpar filtros ou cadastrar novos itens.
          </p>
        )}

        {/* 📄 Controles de Paginação */}
        {totalPaginas > 1 && (
          <div className="hp-pagination">
            <button
              className="hp-pagination__btn hp-pagination__btn--prev"
              onClick={() => changePagina((p) => Math.max(0, p - 1))}
              disabled={paginaAtual === 0}
            >
              ← Anterior
            </button>

            <div className="hp-pagination__numbers">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  className={`hp-pagination__number ${paginaAtual === i ? "hp-pagination__number--active" : ""
                    }`}
                  onClick={() => changePagina(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              className="hp-pagination__btn hp-pagination__btn--next"
              onClick={() => changePagina((p) => Math.min(totalPaginas - 1, p + 1))}
              disabled={paginaAtual === totalPaginas - 1}
            >
              Próxima →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
