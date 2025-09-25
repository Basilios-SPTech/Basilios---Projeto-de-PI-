
import React from "react";

export default function ProdutoCard({ produto, onEditar, onDeletar }) {
  const placeholder = "https://placehold.co/400x300/orange/";
  return (
    <div className="card-produto">
      <img
        src={produto.imagem || placeholder}
        alt={`Produto: ${produto.nome}`}
        onError={(e) => (e.target.src = "https://placehold.co/400x300/orange/white?text=Imagem+Indisponivel")}
      />
      <h3 className="texto-lg">{produto.nome}</h3>
      <p className="texto-cinza">{produto.descricao}</p>
      <p className="texto-vermelho">R$ {produto.preco}</p>
      <div className="flex gap-2 mt-4">
        <button onClick={onEditar} className="btn-editar">Editar</button>
        <button onClick={onDeletar} className="btn-deletar">Deletar</button>
      </div>
    </div>
  );
}
