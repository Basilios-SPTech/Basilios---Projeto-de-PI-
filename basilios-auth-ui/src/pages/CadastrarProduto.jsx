// src/pages/CadastrarProduto.jsx

import React, { useEffect, useMemo, useState } from "react";
import ProdutoForm from "../components/ProdutoForm.jsx";
import Modal from "../components/Modal.jsx";
import Header from "../components/HeaderAdm.jsx";
import SidebarAdm from "../components/SidebarAdm.jsx";
import { criarProduto } from "../services/produtosApi.js";

const CHAVE_STORAGE = "produtos-basilios";

// Mapa de subcategorias por categoria (enum values + rótulos)
const SUBCATEGORY_OPTIONS = {
  BURGER: [
    { value: "BEEF", label: "Carne Bovina" },
    { value: "CHICKEN", label: "Frango" },
    { value: "PORK", label: "Porco" },
    { value: "FISH", label: "Peixe" },
    { value: "VEGETARIAN", label: "Vegetariano" },
    { value: "VEGAN", label: "Vegano" },
  ],
  SIDE: [
    { value: "FRIES", label: "Batata Frita" },
    { value: "ONION_RINGS", label: "Onion Rings" },
    { value: "SALAD", label: "Salada" },
    { value: "NUGGETS", label: "Nuggets" },
  ],
  DRINK: [
    { value: "SODA", label: "Refrigerante" },
    { value: "JUICE", label: "Suco" },
    { value: "MILKSHAKE", label: "Milkshake" },
    { value: "BEER", label: "Cerveja" },
    { value: "WATER", label: "Água" },
  ],
  // você pediu pra Dessert ter o mesmo set do DRINK
  DESSERT: [
    { value: "SODA", label: "Refrigerante" },
    { value: "JUICE", label: "Suco" },
    { value: "MILKSHAKE", label: "Milkshake" },
    { value: "BEER", label: "Cerveja" },
    { value: "WATER", label: "Água" },
  ],
  // COMBO sem subcategoria
  COMBO: [],
};

export default function CadastrarProduto() {
  const [produtos, setProdutos] = useState([]);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ingrediente: "",
    preco: "",
    categoria: "",     // ENUM como string: BURGER | SIDE | DRINK | DESSERT | COMBO
    subcategoria: "",  // ENUM como string conforme SUBCATEGORY_OPTIONS[categoria]
    imagem: "",
    pausado: false,
  });

  const [indiceEdicao, setIndiceEdicao] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || "[]");
      setProdutos(Array.isArray(salvo) ? salvo : []);
    } catch {
      setProdutos([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(produtos));
  }, [produtos]);

  function handleChange(e) {
    if (!e?.target) return;

    const { id, name, value, files, type, checked } = e.target;
    const key = id || name;

    // Upload de imagem (preview)
    if (key === "imagem") {
      const file = files?.[0] || null;
      if (!file) {
        setFormData((prev) => ({ ...prev, imagem: "" }));
        return;
      }
      const fr = new FileReader();
      fr.onload = (ev) => {
        setFormData((prev) => ({ ...prev, imagem: ev.target.result }));
      };
      fr.readAsDataURL(file);
      return;
    }

    // Se mudar a categoria, zera subcategoria (evita sujeira)
    if (key === "categoria") {
      setFormData((prev) => ({
        ...prev,
        categoria: value,
        subcategoria: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? !!checked : value,
    }));
  }

  function clearForm() {
    setIndiceEdicao(null);
    setFormData({
      nome: "",
      descricao: "",
      ingrediente: "",
      preco: "",
      categoria: "",
      subcategoria: "",
      imagem: "",
      pausado: false,
    });
  }

  // normaliza preço
  function parsePreco(str) {
    const num = Number(String(str).replace(",", "."));
    if (Number.isNaN(num) || num < 0) return null;
    return Number(num.toFixed(2));
  }

  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();

    if (!formData.nome?.trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    const precoNum = parsePreco(formData.preco);
    if (precoNum === null) {
      alert("Preço inválido.");
      return;
    }

    if (!formData.categoria) {
      alert("Selecione uma categoria válida.");
      return;
    }

    const subOpts = SUBCATEGORY_OPTIONS[formData.categoria] || [];
    if (subOpts.length > 0 && !formData.subcategoria) {
      alert("Selecione uma subcategoria.");
      return;
    }

    // Enviar APENAS "category" e "subcategory" (evita conflito com "categoria/subcategoria")
    const dto = {
      name: formData.nome.trim(),
      description: formData.descricao.trim(),
      price: precoNum,
      category: formData.categoria || null,
      subcategory: formData.subcategoria || null,
      tags: [],
      ingredientes: formData.ingrediente
        ? formData.ingrediente
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : [],
      ingredientsDetailed: [], 
      isPaused: !!formData.pausado,
    };


    // Edição local (sem back)
    if (indiceEdicao !== null) {
      const atualizadoLocal = {
        index: indiceEdicao,
        nome: formData.nome,
        descricao: formData.descricao,
        preco: precoNum.toFixed(2),
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || "",
        pausado: !!formData.pausado,
        imagem: formData.imagem || "",
      };

      setProdutos((prev) =>
        prev.map((p) => (p.index === indiceEdicao ? atualizadoLocal : p))
      );

      setIndiceEdicao(null);
      setModalOpen(false);
      clearForm();
      return;
    }

    // Criação via backend
    try {
      const produtoCriadoDoBack = await criarProduto(dto);

      const novoProdutoLocal = {
        index: produtoCriadoDoBack.id,
        nome: produtoCriadoDoBack.name,
        descricao: produtoCriadoDoBack.description,
        preco: produtoCriadoDoBack.price,
        categoria: produtoCriadoDoBack.category ?? produtoCriadoDoBack.categoria,
        subcategoria:
          produtoCriadoDoBack.subcategory ?? produtoCriadoDoBack.subcategoria,
        pausado:
          produtoCriadoDoBack.paused ??
          produtoCriadoDoBack.isPaused ??
          false,
        imagem: formData.imagem || "",
      };

      setProdutos((prev) => [novoProdutoLocal, ...prev]);
      clearForm();
      alert("Produto criado com sucesso!");
    } catch (err) {
      const payload = err?.response?.data ?? err?.message ?? "Erro desconhecido";
      console.error("Erro ao criar produto:", err);
      alert(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
    }
  }

  function handleCancel() {
    clearForm();
  }

  function handleEditar(produto) {
    setIndiceEdicao(produto.index);

    setFormData({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      ingrediente: produto.ingrediente || "",
      preco: produto.preco || "",
      categoria: produto.categoria || "",
      subcategoria: produto.subcategoria || "",
      imagem: produto.imagem || "",
      pausado: !!produto.pausado,
    });

    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    clearForm();
  }

  function handleDeletar(index) {
    if (!confirm("Apagar este produto?")) return;
    setProdutos((prev) => prev.filter((p) => p.index !== index));
  }

  function handlePausar(index) {
    setProdutos((prev) =>
      prev.map((p) =>
        p.index === index ? { ...p, pausado: !p.pausado } : p
      )
    );
  }

  const previewPreco =
    formData.preco !== "" && !isNaN(Number(String(formData.preco).replace(",", ".")))
      ? Number(String(formData.preco).replace(",", ".")).toFixed(2)
      : "0,00";

  const produtosOrdenados = useMemo(
    () => [...produtos].sort((a, b) => Number(b.index) - Number(a.index)),
    [produtos]
  );

  const secoesPorCategoria = useMemo(() => {
    const map = new Map();
    for (const p of produtosOrdenados) {
      const cat = (p.categoria || "").trim() || "Sem categoria";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }
    return Array.from(map.entries());
  }, [produtosOrdenados]);

  // subcategorias disponíveis conforme categoria selecionada
  const subcatOptions = SUBCATEGORY_OPTIONS[formData.categoria] || [];

  return (
    <div className="cp-page">
      <Header variant="adm" MenuComponent={SidebarAdm} />

      <main className="cp-grid">
        <section className="cp-card cp-form">
          <h2>Informações do produto</h2>
          <p className="cp-muted">Preencha os campos. A imagem ajuda no card.</p>

          {/* Form principal */}
          <ProdutoForm
            formData={formData}
            indiceEdicao={indiceEdicao}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />

          {/* Campo Subcategoria dependente da Categoria */}
          <div className="cp-field">
            <label htmlFor="subcategoria" className="cp-label">
              Subcategoria
            </label>

            <select
              id="subcategoria"
              name="subcategoria"
              className="cp-input"
              value={formData.subcategoria}
              onChange={handleChange}
              disabled={subcatOptions.length === 0}
              required={subcatOptions.length > 0}
            >
              <option value="">
                {subcatOptions.length === 0
                  ? "Sem subcategoria para esta categoria"
                  : "Selecione..."}
              </option>

              {subcatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <small className="cp-hint">
              As opções mudam conforme a categoria selecionada.
            </small>
          </div>
        </section>

        <aside className="cp-right">
          <section className="cp-card cp-preview cp-preview--compact cp-preview--xs">
            <h3>Pré-visualização</h3>

            <div className="cp-preview__card cp-preview__card--compact cp-preview__card--xs">
              <div className="cp-preview__media cp-preview__media--compact cp-preview__media--xs">
                {formData.imagem ? (
                  <img src={formData.imagem} alt="Pré-visualização do produto" />
                ) : (
                  <div className="cp-preview__placeholder">Sem imagem</div>
                )}
              </div>

              <div className="cp-preview__body cp-preview__body--compact">
                <h4>{formData.nome || "Nome do produto"}</h4>

                <p className="cp-preview__desc">
                  {formData.descricao || "Descrição curta do produto..."}
                </p>

                <div
                  className="cp-preview__meta"
                  style={{ gap: ".5rem", display: "flex", alignItems: "center", flexWrap: "wrap" }}
                >
                  <span className="cp-chip">
                    {formData.categoria || "Sem categoria"}
                  </span>

                  {formData.subcategoria ? (
                    <span className="cp-chip cp-chip--alt">
                      {formData.subcategoria}
                    </span>
                  ) : null}

                  <strong className="cp-price">R$ {previewPreco}</strong>
                </div>

                {formData.pausado && (
                  <div className="cp-chip cp-chip--warn mt-2">
                    PAUSADO (não vende)
                  </div>
                )}
              </div>
            </div>
          </section>
        </aside>
      </main>

      <section className="cp-list-wrap">
        <div className="cp-list-head">
          <h2>Produtos cadastrados</h2>
          <p className="cp-muted">
            Seus itens aparecem por categoria. Você pode editar, pausar e excluir.
          </p>
        </div>

        {secoesPorCategoria.length === 0 ? (
          <div className="cp-empty">
            <p>Nenhum produto ainda. Cadastre seu primeiro item!</p>
          </div>
        ) : (
          secoesPorCategoria.map(([categoria, itens]) => (
            <div className="cp-cat-section" key={categoria}>
              <h3 className="cp-cat-title">{categoria}</h3>

              <div className="cp-list">
                {itens.map((p) => (
                  <article
                    key={p.index}
                    className={`product-card ${p.pausado ? "is-paused" : ""}`}
                  >
                    <div className="product-media">
                      {p.imagem ? (
                        <img src={p.imagem} alt={p.nome || "Produto"} />
                      ) : (
                        <div className="product-placeholder">Sem imagem</div>
                      )}

                      {p.pausado && <span className="product-badge">Pausado</span>}
                    </div>

                    <div className="product-body">
                      <h3 className="product-title">{p.nome || "Sem nome"}</h3>

                      <p className="product-desc">{p.descricao || "—"}</p>

                      <div
                        className="product-meta"
                        style={{ gap: ".5rem", display: "flex", alignItems: "center", flexWrap: "wrap" }}
                      >
                        <span className="cp-chip">
                          {p.categoria || "Sem categoria"}
                        </span>

                        {p.subcategoria ? (
                          <span className="cp-chip cp-chip--alt">{p.subcategoria}</span>
                        ) : null}

                        <strong className="cp-price">R$ {p.preco || "0.00"}</strong>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button className="btn btn-ghost" onClick={() => handleEditar(p)}>
                        Editar
                      </button>

                      <button className="btn btn-ghost" onClick={() => handleDeletar(p.index)}>
                        Deletar
                      </button>

                      <button className="btn btn-ghost" onClick={() => handlePausar(p.index)}>
                        {p.pausado ? "Retomar" : "Pausar"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {modalOpen && (
        <Modal open={true} isOpen={true} onClose={handleCloseModal}>
          <div className="cp-modal-overlay" onClick={handleCloseModal}>
            <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
              <header className="cp-modal__header">
                <div className="cp-modal__logo" aria-hidden />
                <h4>Editar Produto</h4>
                <button
                  className="cp-modal__close"
                  onClick={handleCloseModal}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </header>

              <div className="cp-modal__body">
                <ProdutoForm
                  formData={formData}
                  indiceEdicao={indiceEdicao}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseModal}
                />

                {/* Subcategoria também no modal */}
                <div className="cp-field mt-2">
                  <label htmlFor="subcategoria" className="cp-label">
                    Subcategoria
                  </label>

                  <select
                    id="subcategoria"
                    name="subcategoria"
                    className="cp-input"
                    value={formData.subcategoria}
                    onChange={handleChange}
                    disabled={subcatOptions.length === 0}
                    required={subcatOptions.length > 0}
                  >
                    <option value="">
                      {subcatOptions.length === 0
                        ? "Sem subcategoria para esta categoria"
                        : "Selecione..."}
                    </option>

                    {subcatOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
