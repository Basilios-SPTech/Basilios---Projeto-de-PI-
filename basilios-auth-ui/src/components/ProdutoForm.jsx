// src/components/ProdutoForm.jsx

export default function ProdutoForm({
  formData,
  indiceEdicao,
  onChange,
  onSubmit,
  onCancel,
  onToggleAllAdicionalSubcategories,
  subcatOptions = [],
  showCloseButton = false,
  categorias = [],
  adicionalSubcategoryOptions = [],
  isSaving = false,
  savingText = "",
}) {
  const selectedAdicionalSubcategories = Array.isArray(formData.adicionalSubcategories)
    ? formData.adicionalSubcategories
    : [];
  const allAdicionaisSelected =
    adicionalSubcategoryOptions.length > 0 &&
    selectedAdicionalSubcategories.length === adicionalSubcategoryOptions.length;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center gap-[clamp(14px,2vw,20px)] mb-[26px]">
        <div className="shrink-0">
          <img
            src="/logo.png"
            alt="Logo Basilios"
            className="max-w-[92px] h-auto rounded-[var(--radius)] border border-[color:var(--border)] shadow-[var(--shadow-sm)]"
          />
        </div>

        <h2
          id="titulo-form"
          className="mb-0 border-b-0 ml-[40px] text-[var(--fs-h2)] font-extrabold text-[color:var(--text)]"
        >
          {indiceEdicao !== null ? "Editar Produto" : "Cadastro de Produtos"}
        </h2>
      </div>

      {/* Formulário */}
      <form id="form-produto" className="form-bloco" onSubmit={onSubmit}>
        {showCloseButton && (
          <button
            type="button"
            aria-label="Fechar"
            onClick={onCancel}
            className="cp-modal__close absolute right-3 top-3"
            disabled={isSaving}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '22px',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        )}
        <fieldset className="cp-form__fieldset" disabled={isSaving}>
        <div className="grid-1-2">
          {/* Nome */}
          <div className="field-row">
            <label htmlFor="nome" className="field-label">
              Nome do Produto
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Ex.: X-Burger Duplo"
              className="input-base"
              value={formData.nome}
              onChange={onChange}
              required
            />
          </div>

          {/* Descrição */}
          <div className="field-row">
            <label htmlFor="descricao" className="field-label">
              Descrição
            </label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              placeholder="Hambúrguer artesanal com carne suculenta..."
              className="input-base"
              value={formData.descricao}
              onChange={onChange}
              required
            />
          </div>

          {/* Preço */}
          <div className="field-row">
            <label htmlFor="preco" className="field-label">
              Preço
            </label>
            <input
              type="text"
              id="preco"
              name="preco"
              placeholder="Ex.: 34,90"
              className="input-base"
              value={formData.preco}
              onChange={onChange}
              inputMode="decimal"
              required
            />
          </div>

          {/* Imagem (só front preview ainda) */}
          <div className="field-row">
            <label htmlFor="imagem" className="field-label">
              Imagem
            </label>
            <input
              type="file"
              id="imagem"
              name="imagem"
              className="input-base"
              accept="image/*"
              onChange={onChange}
            />
            <p className="text-[12px] text-[color:var(--muted)] mt-1">
            </p>
          </div>

          {/* Categoria (ENUM do backend) */}
          <div className="field-row">
            <label htmlFor="categoria" className="field-label">
              Catálogo
            </label>
            <div className="relative">
              <select
                id="categoria"
                name="categoria"
                className="input-base appearance-none pr-10"
                value={formData.categoria ?? ""}
                onChange={onChange}
                required
              >
                <option value="" disabled>
                  Selecione uma categoria…
                </option>

                {(categorias && categorias.length > 0 ? categorias : []).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* setinha */}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60"
              >
                <path
                  d="M6 8l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[12px] text-[color:var(--muted)] mt-1 leading-snug pl-1">
              Selecione o catálogo do seu produto
            </p>
          </div>

          {/* Subcategoria (muda conforme categoria) */}
          <div className="field-row">
            <label htmlFor="subcategoria" className="field-label">
              Subcategoria (opcional)
            </label>

            <select
              id="subcategoria"
              name="subcategoria"
              className="input-base"
              value={formData.subcategoria}
              onChange={onChange}
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

            <p className="text-[12px] text-[color:var(--muted)] mt-1">
              As opções mudam conforme o Catálogo.
            </p>
          </div>

          {/* Disponibilidade (pausado / ativo) */}
          {/* Moved: this will render above the action buttons (see below) */}
        </div>

        <div className="cp-link-additions">
          <div className="cp-link-additions__header">
            <div>
              <h4>Vincular adicionais</h4>
              <p>Quais adicionais serão vinculados a este produto?</p>
            </div>
            <button
              type="button"
              className="cp-link-additions__toggle"
              onClick={onToggleAllAdicionalSubcategories}
            >
              Selecionar/Limpar tudo
            </button>
          </div>

          <div className="cp-link-additions__options">
            {adicionalSubcategoryOptions.map((option) => {
              const checked = selectedAdicionalSubcategories.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={`cp-link-additions__option ${checked ? "is-selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    name="adicionalSubcategories"
                    value={option.value}
                    checked={checked}
                    onChange={onChange}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Ações */}
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" className="btn-salvar">
            {isSaving
              ? savingText || "Salvando produto..."
              : indiceEdicao !== null
                ? "Atualizar Produto"
                : "Salvar Produto"}
          </button>

          {indiceEdicao !== null && (
            <button
              type="button"
              id="btn-cancelar"
              className="btn-cancelar"
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
        </div>
        </fieldset>
      </form>
    </div>
  );
}
