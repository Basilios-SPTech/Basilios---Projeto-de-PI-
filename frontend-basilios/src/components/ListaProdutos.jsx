import React, { useState } from "react";
import ProdutoCard from "./ProdutoCard";
import Modal from "./Modal";
import ProdutoForm from "./ProdutoForm";

export default function ListaProdutos({ categoriasAgrupadas, onEditar, onDeletar, onPausar }) {
  const [produtoEditando, setProdutoEditando] = useState(null);

  const categorias = Object.keys(categoriasAgrupadas);

  if (categorias.length === 0) {
    return (
      <div className="lista-produtos">
        <h2 className="titulo-lista">Produtos Cadastrados</h2>
        <div id="msg-sem-produtos" className="msg-sem-produtos">
          Nenhum produto cadastrado ainda.
        </div>
      </div>
    );
  }

  return (
    <div className="lista-produtos">
      <h2 className="titulo-lista">Produtos Cadastrados</h2>
      {categorias.map((categoria) => (
        <div key={categoria} className="secao-categoria">
          <h3 className="titulo-categoria">{categoria}</h3>
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
              const { id, value } = e.target;
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
