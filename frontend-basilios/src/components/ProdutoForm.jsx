import logo from "../assets/logo.png";
export default function ProdutoForm({ formData, indiceEdicao, onChange, onSubmit, onCancel }) {
  return (
    <div className="formulario">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} alt="Logo Basilios" className="logo-imagem" />
        </div>
        <h2 id="titulo-form" className="titulo-formulario">
          {indiceEdicao !== null ? "Editar Produto" : "Cadastrar Produtos"}
        </h2>
      </div>
      <form id="form-produto" className="espaco" onSubmit={onSubmit}>
        <div className="gradegrade">
          <input
            type="text"
            id="nome"
            placeholder="Nome do Produto"
            className="campoborda"
            value={formData.nome}
            onChange={onChange}
            required
          />

          <input
            type="text"
            id="descricao"
            placeholder="Descrição"
            className="campoborda"
            value={formData.descricao}
            onChange={onChange}
            required
          />
        </div>

        <div className="grade grade-1-2 gap-4">
          <input
            type="number"
            id="preco"
            placeholder="Preço (R$)"
            step="0.01"
            className="campoborda"
            value={formData.preco}
            onChange={onChange}
            required
          />

          <input
            type="file"
            id="imagem"
            className="campoborda"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                  onChange({
                    target: {
                      id: "imagem",
                      value: reader.result,
                    },
                  });
                };
                reader.readAsDataURL(file);

                onChange({
                  target: {
                    id: "imagemPreview",
                    value: previewUrl,
                  },
                });
              }
            }}
          />
        </div>

        <div className="grade">
          <select
            id="categoria"
            className="campoborda"
            value={formData.categoria}
            onChange={onChange}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option>Lanches Premium</option>
            <option>X-Burguer</option>
            <option>Acompanhamentos</option>
            <option>Burguers Vegetariano</option>
            <option>X Picanha</option>
            <option>X-Costela</option>
            <option>X Salmão</option>
            <option>X Calabresa</option>
            <option>X-Filé</option>
            <option>X Mignon</option>
            <option>Vegetarianos</option>
            <option>X Burguer Picanha</option>
            <option>Beirutes</option>
            <option>Hot Dog</option>
            <option>Lanches Tradicionais</option>
            <option>Bebidas</option>
            <option>Opções de Pães</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn-salvar">
            {indiceEdicao !== null ? "Atualizar Produto" : "Salvar Produto"}
          </button><br /><br />

          {indiceEdicao !== null && (
            <button type="button" id="btn-cancelar" className="btn-cancelar" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
