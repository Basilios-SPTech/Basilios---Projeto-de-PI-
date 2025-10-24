// src/pages/Home.jsx 
import { useEffect, useMemo, useState } from "react";
import Header from "../components/header.jsx";

const CHAVE_STORAGE = "produtos-basilios";
const CHAVE_CART = "carrinho-basilios";

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || "[]");
      const ativos = (Array.isArray(salvo) ? salvo : []).filter((p) => !p.pausado);
      setProdutos(ativos);
    } catch {
      setProdutos([]);
    }
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
      const okCat = cat === "Todas" || (p.categoria || "").trim() == cat;
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

  function addToCart(produto) {
    const carrinho = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
    const novo = Array.isArray(carrinho) ? carrinho : [];
    novo.push({
      id: produto.index,
      nome: produto.nome,
      preco: Number(produto.preco || "0"),
      qtd: 1,
      imagem: produto.imagem || "",
      categoria: produto.categoria || "",
    });
    localStorage.setItem(CHAVE_CART, JSON.stringify(novo));
    setCartCount(novo.length);
  }

  return (
    <div className="home-page page-with-fixed-header">
      <Header />
      <section className="hp-grid-wrap">
        {cat === "Todas" ? (
          secoesPorCategoria.length === 0 ? (
            <p className="hp-empty">
              Nada por aqui… Experimente limpar filtros ou cadastrar novos itens.
            </p>
          ) : (
            secoesPorCategoria.map(([categoria, itens]) => (
              <div key={categoria} className="hp-section">
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
                            {Number(p.preco || "0").toFixed(2).replace(".", ",")}
                          </strong>
                        </div>
                        <button
                          className="btn btn-primary hp-add"
                          onClick={() => addToCart(p)}
                        >
                          Adicionar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          filtrados.length === 0 ? (
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
                        {Number(p.preco || "0").toFixed(2).replace(".", ",")}
                      </strong>
                    </div>
                    <button
                      className="btn btn-primary hp-add"
                      onClick={() => addToCart(p)}
                    >
                      Adicionar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}
