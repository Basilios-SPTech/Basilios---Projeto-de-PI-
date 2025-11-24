// src/components/ProdutoForm.jsx
const CATEGORIAS_BACKEND = [
  { label: "Lanches / Hambúrguer", value: "BURGER" },
  { label: "Combo / Promoção", value: "COMBO" },
  { label: "Acompanhamento / Side", value: "SIDE" },
  { label: "Bebidas", value: "DRINK" },
  { label: "Sobremesa", value: "DESSERT" },
];

export default function ProdutoForm({
  formData,
  indiceEdicao,
  onChange,
  onSubmit,
  onCancel,
}) {
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

          {/* Ingredientes (a API ainda não usa diretamente, mas vamos coletar) */}
          <div className="field-row">
            <label htmlFor="ingrediente" className="field-label">
              Ingredientes
            </label>
            <input
              type="text"
              id="ingrediente"
              name="ingrediente"
              placeholder="Ex.: Pão, 2x hambúrguer, queijo, molho da casa…"
              className="input-base"
              value={formData.ingrediente ?? ""}
              onChange={onChange}
            />
            <p className="text-[12px] text-[color:var(--muted)] mt-1">
              (Opcional. Só pra referência interna por enquanto)
            </p>
          </div>

          {/* Preço */}
          <div className="field-row">
            <label htmlFor="preco" className="field-label">
              Preço
            </label>
            <input
              type="number"
              id="preco"
              name="preco"
              placeholder="Ex.: 34.90"
              className="input-base"
              value={formData.preco}
              onChange={onChange}
              step="0.01"
              min="0"
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
              A imagem ainda não vai pro backend, só pro preview interno.
            </p>
          </div>

          {/* Categoria (ENUM do backend) */}
          <div className="field-row">
            <label htmlFor="categoria" className="field-label">
              Categoria
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

                {CATEGORIAS_BACKEND.map((cat) => (
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
            <p className="text-[12px] text-[color:var(--muted)] mt-1 leading-snug">
              Isso precisa bater com o enum do backend:
              BURGER / COMBO / SIDE / DRINK / DESSERT
            </p>
          </div>

          {/* Disponibilidade (pausado / ativo) */}
          <div className="field-row">
            <label className="field-label">Disponibilidade</label>

            <label className="flex items-center gap-2 text-[14px] text-[color:var(--text)]">
              <input
                type="checkbox"
                id="pausado"
                name="pausado"
                checked={!!formData.pausado}
                onChange={onChange}
                className="h-[16px] w-[16px]"
              />
              <span>
                Pausado (Marcar = não aparece pra venda / está fora do cardápio)
              </span>
            </label>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" className="btn-salvar">
            {indiceEdicao !== null ? "Atualizar Produto" : "Salvar Produto"}
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
      </form>
    </div>
  );
}
