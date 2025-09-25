
import React from "react";
import ProdutoCard from "./ProdutoCard"; 

export default function ListaProdutos({ categoriasAgrupadas, onEditar, onDeletar }) {
  const categorias = Object.keys(categoriasAgrupadas);

  if (categorias.length === 0) {
    return (
      <div className="lista-produtos">
        <h2 className="titulo-lista">Produtos Cadastrados</h2>
        <div id="msg-sem-produtos" className="msg-sem-produtos">Nenhum produto cadastrado ainda.</div>
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
                onEditar={() => onEditar(produto.index)}
                onDeletar={() => onDeletar(produto.index)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}