import React, { useState, useEffect } from "react";
import "./App.css";
import ProdutoForm from "./components/ProdutoForm";
import ListaProdutos from "./components/ListaProdutos";

const CHAVE_STORAGE = "produtos-basilios";

export default function CadastrarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: "",
    categoria: "",
    pausado: false,
  });

  // Carrega do localStorage
  useEffect(() => {
    const salvos = localStorage.getItem(CHAVE_STORAGE);
    if (salvos) setProdutos(JSON.parse(salvos));
  }, []);

  // Salva no localStorage
  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(produtos));
  }, [produtos]);

  // Handle change (para formulário principal)
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Adicionar produto
  const handleSubmit = (e) => {
    e.preventDefault();
    setProdutos((prev) => [
      ...prev,
      { ...formData, index: prev.length, pausado: false },
    ]);
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      imagem: "",
      categoria: "",
      pausado: false,
    });
  };

  // Editar produto (vem do modal)
  const handleEditar = (index, atualizado) => {
    setProdutos((prev) =>
      prev.map((p, i) => (i === index ? { ...atualizado, index: i } : p))
    );
  };

  // Deletar
  const handleDeletar = (index) => {
    setProdutos((prev) => prev.filter((_, i) => i !== index));
  };

  // Pausar
  const handlePausar = (index) => {
    setProdutos((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, pausado: !p.pausado } : p
      )
    );
  };

  // Agrupa por categoria
  const categoriasAgrupadas = produtos.reduce((acc, produto) => {
    if (!acc[produto.categoria]) acc[produto.categoria] = [];
    acc[produto.categoria].push(produto);
    return acc;
  }, {});

  return (
    <div className="container">
      <div className="cabecalho">
        <h1 className="titulo-principal">Cadastro de Produtos</h1>
      </div>

      {/* Formulário principal (cadastrar novo produto) */}
      <ProdutoForm
        formData={formData}
        indiceEdicao={null}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {/* Lista de produtos */}
      <ListaProdutos
        categoriasAgrupadas={categoriasAgrupadas}
        onEditar={handleEditar}
        onDeletar={handleDeletar}
        onPausar={handlePausar}
      />
    </div>
  );
}
