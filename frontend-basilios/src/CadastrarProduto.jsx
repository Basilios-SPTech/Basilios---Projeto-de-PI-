
import React, { useState, useEffect } from "react";
import "./App.css";
import ProdutoForm from "./components/ProdutoForm";
import ListaProdutos from "./components/ListaProdutos";

const CHAVE_STORAGE = "produtos-basilios";

export default function CadastrarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [indiceEdicao, setIndiceEdicao] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: "",
    categoria: ""
  });

  useEffect(() => {
    const armazenados = JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
    setProdutos(armazenados);
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(produtos));
  }, [produtos]);

  function handleChange(e) {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  function salvarProduto(e) {
    e.preventDefault();
    const { nome, descricao, preco, imagem, categoria } = formData;

    if (!nome || !descricao || !preco || !categoria) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const novoProduto = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: parseFloat(preco),
      imagem: imagem.trim(),
      categoria: categoria.trim()
    };

    if (indiceEdicao !== null) {
      const copia = [...produtos];
      copia[indiceEdicao] = novoProduto;
      setProdutos(copia);
      setIndiceEdicao(null);
    } else {
      setProdutos((prev) => [...prev, novoProduto]);
    }

    resetarFormulario();
  }

  function editarProduto(i) {
    setFormData({ ...produtos[i] });
    setIndiceEdicao(i);
  }

  function deletarProduto(i) {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      const copia = [...produtos];
      copia.splice(i, 1);
      setProdutos(copia);
      if (indiceEdicao !== null && indiceEdicao === i) {
        resetarFormulario();
        setIndiceEdicao(null);
      }
    }
  }

  function cancelarEdicao() {
    resetarFormulario();
    setIndiceEdicao(null);
  }

  function resetarFormulario() {
    setFormData({ nome: "", descricao: "", preco: "", imagem: "", categoria: "" });
  }

  const categoriasAgrupadas = produtos.reduce((acc, produto, i) => {
    if (!acc[produto.categoria]) acc[produto.categoria] = [];
    acc[produto.categoria].push({ ...produto, index: i });
    return acc;
  }, {});

  return (
    <div className="container">
      <header className="cabecalho">
        <h1 className="titulo-principal">Basilios</h1>
      </header>

      <ProdutoForm
        formData={formData}
        indiceEdicao={indiceEdicao}
        onChange={handleChange}
        onSubmit={salvarProduto}
        onCancel={cancelarEdicao}
      />

      <ListaProdutos
        categoriasAgrupadas={categoriasAgrupadas}
        onEditar={editarProduto}
        onDeletar={deletarProduto}
      />
    </div>
  );
}

