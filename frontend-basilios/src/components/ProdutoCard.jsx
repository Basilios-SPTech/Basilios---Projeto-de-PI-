import React, { useState } from "react";

export default function ProdutoCard({ produto, onEditar, onDeletar, onPausar }) {
  const [imageError, setImageError] = useState(false);
  const placeholder = "https://placehold.co/400x300/orange/white?text=Imagem+Indisponivel";

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = placeholder;
  };

  return (
    <div className={`card-produto ${produto.pausado ? "pausado" : ""}`}>
      <img
        src={!imageError ? (produto.imagem || placeholder) : placeholder}
        alt={`Produto: ${produto.nome}`}
        onError={handleImageError}
        className="block mx-auto h-40 md:h-48 w-auto max-w-full object-contain rounded-lg"
      />

      <p className="texto-lg">{produto.nome}</p>
      <p className="texto-cinza">{produto.descricao}</p>

      <p className="texto-vermelho">R$ {produto.preco}</p>

      <div className="flex gap-2 mt-4">
        <button onClick={onEditar} className="btn-editar">Editar</button>
        <button onClick={onDeletar} className="btn-deletar">Deletar</button>
        <button onClick={onPausar} className="btn-pausar">
          {produto.pausado ? "Ativar" : "Pausar"}
        </button>
      </div>
    </div>
  );
}
