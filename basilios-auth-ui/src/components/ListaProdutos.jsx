import React, { useState } from "react";
import ProdutoCard from "./ProdutoCard";
import Modal from "./Modal";
import ProdutoForm from "./ProdutoForm";

export default function ListaProdutos({ categoriasAgrupadas, onEditar, onDeletar, onPausar }) {
  const [produtoEditando, setProdutoEditando] = useState(null);

  const categorias = Object.keys(categoriasAgrupadas);

  if (categorias.length === 0) {
    return (
      <div>
        <h2 className="titulo-lista">Produtos Cadastrados</h2>
        <div id="msg-sem-produtos">
          Nenhum produto cadastrado ainda.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="titulo-lista">Produtos Cadastrados</h2>

      {categorias.map((categoria) => (
        <div key={categoria}>
          <h3>{categoria}</h3>

          <div className="grade-produtos">
            {categoriasAgrupadas[categoria].map((produto) => (
              <ProdutoCard
                key={produto.index}
                produto={produto}
                onEditar={() => setProdutoEditando(produto)}
                onDeletar={() => onDeletar(produto.index)}
                onPausar={() => onPausar(produto.index)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Modal de edição */}
      <Modal
        isOpen={!!produtoEditando}
        onClose={() => setProdutoEditando(null)}
      >
        {produtoEditando && (
          <ProdutoForm
            formData={produtoEditando}
            indiceEdicao={produtoEditando.index}
            onChange={(e) => {
              const { id } = e.target;

              let value = e.target.value;

              const preview = e.target.preview;
              const file =
                (e.target.files && e.target.files[0]) ||
                (value instanceof File ? value : null);

              if (id === "imagem") {
                if (typeof preview === "string") {
                  value = preview;
                } else if (file) {
                  value = URL.createObjectURL(file);
                } else if (typeof value !== "string") {
                  value = "";
                }
              }

              setProdutoEditando((prev) => ({ ...prev, [id]: value }));
            }}
            onSubmit={(e) => {
              e.preventDefault();
              onEditar(produtoEditando.index, produtoEditando);
              setProdutoEditando(null);
            }}
            onCancel={() => setProdutoEditando(null)}
          />
        )}
      </Modal>
    </div>
  );
}
