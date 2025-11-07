// src/pages/CadastrarProduto.jsx

import React, { useEffect, useMemo, useState } from "react";
import ProdutoForm from "../components/ProdutoForm.jsx";
import Modal from "../components/Modal.jsx";
import Header from "../components/HeaderAdm.jsx";
import SidebarAdm from "../components/SidebarAdm.jsx";
import { criarProduto } from "../services/produtosApi.js";

const CHAVE_STORAGE = "produtos-basilios";

export default function CadastrarProduto() {
  // -----------------------------
  // STATE PRINCIPAL DA TELA
  // -----------------------------
  const [produtos, setProdutos] = useState([]);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ingrediente: "", // <-- agora tem ingredientes
    preco: "",
    categoria: "", // vai ser BURGER | COMBO | SIDE | DRINK | DESSERT
    imagem: "",
    pausado: false, // checkbox "pausado"
  });

  const [indiceEdicao, setIndiceEdicao] = useState(null); // quando != null significa modo edição
  const [modalOpen, setModalOpen] = useState(false);

  // -----------------------------
  // CARREGAR PRODUTOS DO LOCALSTORAGE AO MONTAR
  // -----------------------------
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || "[]");
      setProdutos(Array.isArray(salvo) ? salvo : []);
    } catch {
      setProdutos([]);
    }
  }, []);

  // -----------------------------
  // SINCRONIZAR LOCALSTORAGE SEMPRE QUE PRODUTOS MUDA
  // -----------------------------
  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(produtos));
  }, [produtos]);

  // -----------------------------
  // HANDLE CHANGE (inputs do form)
  // -----------------------------
  function handleChange(e) {
    if (!e?.target) return;

    const { id, name, value, files, type, checked } = e.target;
    const key = id || name;

    // upload de imagem: salva preview base64 só no front
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

    // checkbox vs texto
    setFormData((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? !!checked : value,
    }));
  }

  // -----------------------------
  // LIMPAR FORM
  // -----------------------------
  function clearForm() {
    setIndiceEdicao(null);
    setFormData({
      nome: "",
      descricao: "",
      ingrediente: "",
      preco: "",
      categoria: "",
      imagem: "",
      pausado: false,
    });
  }

  // -----------------------------
  // SUBMIT (criar ou atualizar)
  // -----------------------------
  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();

    // validações básicas
    if (!formData.nome?.trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    const precoNum = Number(String(formData.preco).replace(",", "."));
    if (Number.isNaN(precoNum) || precoNum < 0) {
      alert("Preço inválido.");
      return;
    }

    if (!formData.categoria) {
      alert("Selecione uma categoria válida.");
      return;
    }

    // DTO pro backend (POST /api/menu)
    // Isso é o formato que seu Spring Boot espera
    const dto = {
      name: formData.nome,
      description: formData.descricao,
      price: precoNum,
      category: formData.categoria, // já vem BURGER | COMBO | SIDE | DRINK | DESSERT
      subcategory: null, // não temos campo pra isso no form ainda
      isPaused: !!formData.pausado,
      // ingredientes e tags ainda não estão modelados no backend,
      // mas deixo referência pra evolução
      // Exemplo de conversão simples: "pão, carne, queijo" -> ["pão","carne","queijo"]
      ingredientes: formData.ingrediente
        ? formData.ingrediente.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      tags: [],
    };

    // Se estamos editando um produto que já existe na lista local
    if (indiceEdicao !== null) {
      // Ainda não temos endpoint PUT no back, então edita só local
      const atualizadoLocal = {
        index: indiceEdicao,
        nome: formData.nome,
        descricao: formData.descricao,
        preco: precoNum.toFixed(2),
        categoria: formData.categoria,
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

    // Caso contrário: criação nova -> chamar backend
    try {
      const produtoCriadoDoBack = await criarProduto(dto);

      // Monta o que vamos guardar localmente pra renderizar
      const novoProdutoLocal = {
        index: produtoCriadoDoBack.id, // usamos o id real do banco
        nome: produtoCriadoDoBack.name,
        descricao: produtoCriadoDoBack.description,
        preco: produtoCriadoDoBack.price,
        categoria: produtoCriadoDoBack.category,
        pausado:
          produtoCriadoDoBack.paused ??
          produtoCriadoDoBack.isPaused ??
          false,
        imagem: formData.imagem || "", // preview base64 só no admin, backend ainda não salva imagem
      };

      // sobe o novo no topo da lista
      setProdutos((prev) => [novoProdutoLocal, ...prev]);

      clearForm();
      alert("Produto criado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      alert("Deu ruim ao salvar no servidor (POST /api/menu).");
    }
  }

  // -----------------------------
  // CANCELAR (só limpa)
  // -----------------------------
  function handleCancel() {
    clearForm();
  }

  // -----------------------------
  // EDITAR (abrir modal com dados atuais)
  // -----------------------------
  function handleEditar(produto) {
    setIndiceEdicao(produto.index);

    setFormData({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      ingrediente: produto.ingrediente || "", // pode estar vazio
      preco: produto.preco || "",
      categoria: produto.categoria || "",
      imagem: produto.imagem || "",
      pausado: !!produto.pausado,
    });

    setModalOpen(true);
  }

  // -----------------------------
  // FECHAR MODAL
  // -----------------------------
  function handleCloseModal() {
    setModalOpen(false);
    clearForm();
  }

  // -----------------------------
  // DELETAR LOCAL (ainda sem DELETE no backend)
  // -----------------------------
  function handleDeletar(index) {
    if (!confirm("Apagar este produto?")) return;
    setProdutos((prev) => prev.filter((p) => p.index !== index));
  }

  // -----------------------------
  // PAUSAR / DESPAUSAR LOCAL (ainda sem PATCH no backend)
  // -----------------------------
  function handlePausar(index) {
    setProdutos((prev) =>
      prev.map((p) =>
        p.index === index ? { ...p, pausado: !p.pausado } : p
      )
    );
  }

  // -----------------------------
  // DERIVADOS PRA UI
  // -----------------------------
  const previewPreco =
    formData.preco !== "" &&
    !isNaN(Number(String(formData.preco).replace(",", ".")))
      ? Number(String(formData.preco).replace(",", ".")).toFixed(2)
      : "0,00";

  // ordena os produtos por index desc
  const produtosOrdenados = useMemo(
    () => [...produtos].sort((a, b) => Number(b.index) - Number(a.index)),
    [produtos]
  );

  // separa em seções por categoria
  const secoesPorCategoria = useMemo(() => {
    const map = new Map();
    for (const p of produtosOrdenados) {
      const cat = (p.categoria || "").trim() || "Sem categoria";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }
    return Array.from(map.entries());
  }, [produtosOrdenados]);

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="cp-page">
      <Header variant="adm" MenuComponent={SidebarAdm} />

      <main className="cp-grid">
        <section className="cp-card cp-form">
          <h2>Informações do produto</h2>
          <p className="cp-muted">
            Preencha os campos. A imagem ajuda no card.
          </p>

          <ProdutoForm
            formData={formData}
            indiceEdicao={indiceEdicao}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </section>

        <aside className="cp-right">
          <section className="cp-card cp-preview cp-preview--compact cp-preview--xs">
            <h3>Pré-visualização</h3>

            <div className="cp-preview__card cp-preview__card--compact cp-preview__card--xs">
              <div className="cp-preview__media cp-preview__media--compact cp-preview__media--xs">
                {formData.imagem ? (
                  <img
                    src={formData.imagem}
                    alt="Pré-visualização do produto"
                  />
                ) : (
                  <div className="cp-preview__placeholder">Sem imagem</div>
                )}
              </div>

              <div className="cp-preview__body cp-preview__body--compact">
                <h4>{formData.nome || "Nome do produto"}</h4>

                <p className="cp-preview__desc">
                  {formData.descricao || "Descrição curta do produto..."}
                </p>

                <div className="cp-preview__meta">
                  <span className="cp-chip">
                    {formData.categoria || "Sem categoria"}
                  </span>

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
            Seus itens aparecem por categoria. Você pode editar, pausar
            e excluir.
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
                    className={`product-card ${
                      p.pausado ? "is-paused" : ""
                    }`}
                  >
                    <div className="product-media">
                      {p.imagem ? (
                        <img src={p.imagem} alt={p.nome || "Produto"} />
                      ) : (
                        <div className="product-placeholder">Sem imagem</div>
                      )}

                      {p.pausado && (
                        <span className="product-badge">Pausado</span>
                      )}
                    </div>

                    <div className="product-body">
                      <h3 className="product-title">
                        {p.nome || "Sem nome"}
                      </h3>

                      <p className="product-desc">
                        {p.descricao || "—"}
                      </p>

                      <div className="product-meta">
                        <span className="cp-chip">
                          {p.categoria || "Sem categoria"}
                        </span>

                        <strong className="cp-price">
                          R$ {p.preco || "0.00"}
                        </strong>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleEditar(p)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-ghost"
                        onClick={() => handleDeletar(p.index)}
                      >
                        Deletar
                      </button>

                      <button
                        className="btn btn-ghost"
                        onClick={() => handlePausar(p.index)}
                      >
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
            <div
              className="cp-modal"
              onClick={(e) => e.stopPropagation()}
            >
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
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
