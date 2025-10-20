<img src="/logo.png" alt="Logo" />
const CATEGORIAS = [
  "Combos-Promoção",
  "Lanches Premium",
  "X-Burguer",
  "Acompanhamentos",
  "Burguers Vegetariano",
  "X-Picanha",
  "Costela",
  "X-Salmão",
  "X-Calabresa",
  "X-Filé de Frango",
  "X-Filé Mignon",
  "Vegetarianos",
  "X-Burguer Picanha",
  "Beirutes",
  "Hot-Dog",
  "Lanches Tradicionais",
  "Bebidas",
  "Opções de Pães",
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
            <label htmlFor="nome" className="field-label">Nome do Produto</label>
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
            <label htmlFor="descricao" className="field-label">Descrição</label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              placeholder="Ex.: Pão, 2x hambúrguer, queijo, molho da casa…"
              className="input-base"
              value={formData.descricao}
              onChange={onChange}
              required
            />
          </div>

          {/* Preço */}
          <div className="field-row">
            <label htmlFor="preco" className="field-label">Preço</label>
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

          {/* Imagem (arquivo) */}
          <div className="field-row">
            <label htmlFor="imagem" className="field-label">Imagem</label>
            <input
              type="file"
              id="imagem"
              name="imagem"
              className="input-base"
              accept="image/*"
              onChange={onChange}
            />
          </div>

          {/* Categoria (select) */}
          <div className="field-row">
            <label htmlFor="categoria" className="field-label">Categoria</label>
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
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
