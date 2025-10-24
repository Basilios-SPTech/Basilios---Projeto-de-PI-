// src/pages/CadastrarProduto.jsx
import React, { useEffect, useMemo, useState } from "react";
import ProdutoForm from "../components/ProdutoForm.jsx";
import Modal from "../components/Modal.jsx";
import Header from "../components/HeaderAdm.jsx";
import SidebarAdmBasilios from "../components/SidebarAdmBasilios.jsx";

const CHAVE_STORAGE = "produtos-basilios";

export default function CadastrarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
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
      preco: "",
      categoria: "",
      imagem: "",
      pausado: false,
    });
  }

  function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();

    if (!formData.nome?.trim()) return alert("Informe o nome do produto.");
    const precoNum = Number(String(formData.preco).replace(",", "."));
    if (Number.isNaN(precoNum) || precoNum < 0) return alert("Preço inválido.");

    const novo = {
      ...formData,
      preco: precoNum.toFixed(2),
      index: indiceEdicao ?? Date.now(),
    };

    if (indiceEdicao !== null) {
      setProdutos((prev) =>
        prev.map((p) => (p.index === indiceEdicao ? novo : p))
      );
      setIndiceEdicao(null);
      setModalOpen(false);
    } else {
      setProdutos((prev) => [novo, ...prev]);
    }

    clearForm();
  }

  function handleCancel() {
    clearForm();
  }

  function handleEditar(produto) {
    setIndiceEdicao(produto.index);
    setFormData({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      preco: produto.preco || "",
      categoria: produto.categoria || "",
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

  return (
    <div className="cp-page">

      <Header variant="adm" MenuComponent={SidebarAdmBasilios} />
      {/* Form + Preview (preview ainda mais compacto) */}
      <main className="cp-grid">
        <section className="cp-card cp-form">
          <h2>Informações do produto</h2>
          <p className="cp-muted">Preencha os campos. A imagem ajuda no card.</p>

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
                <div className="cp-preview__meta">
                  <span className="cp-chip">
                    {formData.categoria || "Sem categoria"}
                  </span>
                  <strong className="cp-price">R$ {previewPreco}</strong>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </main>

      {/* Lista agrupada por categoria */}
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
                      <div className="product-meta">
                        <span className="cp-chip">{p.categoria || "Sem categoria"}</span>
                        <strong className="cp-price">R$ {(p.preco || "0.00")}</strong>
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

      {/* Modal só é renderizado quando estiver aberto (evita “aparecer embaixo”) */}
      {modalOpen && (
        <Modal open={true} isOpen={true} onClose={handleCloseModal}>
          {/* Overlay + container próprios: garante centralização mesmo se o Modal for simples */}
          <div className="cp-modal-overlay" onClick={handleCloseModal}>
            <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
              <header className="cp-modal__header">
                <div className="cp-modal__logo" aria-hidden />
                <h4>Editar Produto</h4>
                <button className="cp-modal__close" onClick={handleCloseModal} aria-label="Fechar">×</button>
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
