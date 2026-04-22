import React, { useState } from "react";
import toast from "react-hot-toast";

export default function CategoryManager({
  categories,
  subcategories,
  onAddCategory,
  onAddSubcategory,
}) {
  const [showModal, setShowModal] = useState(false);
  const [tabAtivo, setTabAtivo] = useState("categoria"); // "categoria" ou "subcategoria"
  
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaSubcategoria, setNovaSubcategoria] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  function handleAddCategory() {
    if (!novaCategoria.trim()) {
      toast.error("Digite um nome para a categoria");
      return;
    }

    const categoriaNormalizada = novaCategoria.trim().toUpperCase().replace(/\s+/g, "_");
    const labelCategoria = novaCategoria.trim();

    // Verifica se já existe
    if (categories.some((c) => c.value === categoriaNormalizada)) {
      toast.error("Esta categoria já existe");
      return;
    }

    onAddCategory({ value: categoriaNormalizada, label: labelCategoria });
    setNovaCategoria("");
    toast.success("Categoria criada com sucesso!");
  }

  function handleAddSubcategory() {
    if (!categoriaSelecionada) {
      toast.error("Selecione uma categoria");
      return;
    }

    if (!novaSubcategoria.trim()) {
      toast.error("Digite um nome para a subcategoria");
      return;
    }

    const subcategoriaNormalizada = novaSubcategoria
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");
    const labelSubcategoria = novaSubcategoria.trim();

    // Verifica se já existe na categoria
    const jaExiste = (subcategories[categoriaSelecionada] || []).some(
      (s) => s.value === subcategoriaNormalizada
    );

    if (jaExiste) {
      toast.error("Esta subcategoria já existe nesta categoria");
      return;
    }

    onAddSubcategory(categoriaSelecionada, {
      value: subcategoriaNormalizada,
      label: labelSubcategoria,
    });

    setNovaSubcategoria("");
    toast.success("Subcategoria criada com sucesso!");
  }

  function handleCloseModal() {
    setShowModal(false);
    setNovaCategoria("");
    setNovaSubcategoria("");
    setCategoriaSelecionada("");
    setTabAtivo("categoria");
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setShowModal(true)}
        style={{ marginTop: "1rem" }}
      >
        ➕ Gerenciar Categorias
      </button>

      {showModal && (
        <div
          className="cp-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={handleCloseModal}
          onKeyDown={(e) => e.key === "Escape" && handleCloseModal()}
          aria-label="Fechar modal"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="cp-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "500px",
              padding: "2rem",
              borderRadius: "var(--radius)",
              background: "var(--bg-secondary)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <button
              type="button"
              aria-label="Fechar"
              onClick={handleCloseModal}
              className="cp-modal__close"
              style={{
                position: "absolute",
                right: "1rem",
                top: "1rem",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "var(--text)",
              }}
            >
              ×
            </button>

            <h3 style={{ marginBottom: "1.5rem", marginTop: 0 }}>
              Gerenciar Categorias
            </h3>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => setTabAtivo("categoria")}
                style={{
                  padding: "0.75rem 1rem",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    tabAtivo === "categoria"
                      ? "2px solid var(--primary)"
                      : "transparent",
                  cursor: "pointer",
                  color:
                    tabAtivo === "categoria"
                      ? "var(--primary)"
                      : "var(--muted)",
                  fontWeight: tabAtivo === "categoria" ? "600" : "400",
                  transition: "all 0.3s ease",
                }}
              >
                Nova Categoria
              </button>

              <button
                type="button"
                onClick={() => setTabAtivo("subcategoria")}
                style={{
                  padding: "0.75rem 1rem",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    tabAtivo === "subcategoria"
                      ? "2px solid var(--primary)"
                      : "transparent",
                  cursor: "pointer",
                  color:
                    tabAtivo === "subcategoria"
                      ? "var(--primary)"
                      : "var(--muted)",
                  fontWeight: tabAtivo === "subcategoria" ? "600" : "400",
                  transition: "all 0.3s ease",
                }}
              >
                Nova Subcategoria
              </button>
            </div>

            {/* Conteúdo das Tabs */}
            {tabAtivo === "categoria" && (
              <div>
                <div className="field-row" style={{ marginBottom: "1rem" }}>
                  <label className="field-label">Nome da Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex.: Pizzas, Massas, etc."
                    className="input-base"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddCategory()
                    }
                  />
                  <p className="text-[12px] text-[color:var(--muted)] mt-1">
                    Use nomes descritivos. Será convertido para MAIÚSCULAS_COM_UNDERSCORE
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddCategory}
                  style={{ width: "100%" }}
                >
                  Criar Categoria
                </button>
              </div>
            )}

            {tabAtivo === "subcategoria" && (
              <div>
                <div className="field-row" style={{ marginBottom: "1rem" }}>
                  <label className="field-label">Categoria</label>
                  <select
                    className="input-base"
                    value={categoriaSelecionada}
                    onChange={(e) => setCategoriaSelecionada(e.target.value)}
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-row" style={{ marginBottom: "1rem" }}>
                  <label className="field-label">Nome da Subcategoria</label>
                  <input
                    type="text"
                    placeholder="Ex.: Grande, Média, Pequena..."
                    className="input-base"
                    value={novaSubcategoria}
                    onChange={(e) => setNovaSubcategoria(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddSubcategory()
                    }
                  />
                  <p className="text-[12px] text-[color:var(--muted)] mt-1">
                    Será convertida para MAIÚSCULAS_COM_UNDERSCORE
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddSubcategory}
                  style={{ width: "100%" }}
                >
                  Criar Subcategoria
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
