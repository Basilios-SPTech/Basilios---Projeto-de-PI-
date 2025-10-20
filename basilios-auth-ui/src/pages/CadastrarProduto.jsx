// src/pages/CadastrarProduto.jsx
import React, { useState, useEffect } from "react";

// IMPORTS CORRETOS (de /pages para /components)
import ProdutoForm from "../components/ProdutoForm.jsx";
import ListaProdutos from "../components/ListaProdutos.jsx";

const CHAVE_STORAGE = "produtos-basilios";

export default function CadastrarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: "",     // DataURL (base64) para preview e persistência
    categoria: "",
    pausado: false,
  });

  // ---- Carregar do localStorage (sem semear nada)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAVE_STORAGE);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setProdutos(parsed);
    } catch {
      localStorage.removeItem(CHAVE_STORAGE);
      setProdutos([]);
    }
  }, []);

  // ---- Utilitário: salvar e notificar
  const salvarProdutos = (nextArray) => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(nextArray));
      // Notifica outras telas (Home pode ouvir "produtos-updated")
      window.dispatchEvent(new Event("produtos-updated"));
    } catch (e) {
      console.error("Falha ao salvar no localStorage:", e);
    }
  };

  // ---- onChange genérico + tratamento do <input type="file">
  // Suporta tanto onChange(event) quanto onChange(id, valor)
  const handleChange = (arg1, arg2) => {
    // Caso 1: veio um evento padrão do React
    if (arg1 && arg1.target) {
      const e = arg1;
      const { id, name, value, files, type, checked } = e.target;
      const key = id || name;

      if (key === "imagem") {
        const file = files?.[0] || null;
        if (!file) {
          setFormData((prev) => ({ ...prev, imagem: "" }));
          return;
        }
        const fr = new FileReader();
        fr.onload = (ev) => {
          setFormData((prev) => ({ ...prev, imagem: ev.target.result })); // base64
        };
        fr.readAsDataURL(file);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [key]: type === "checkbox" ? !!checked : value,
      }));
      return;
    }

    // Caso 2: veio no formato (id, valor)
    if (typeof arg1 === "string") {
      const key = arg1;
      const value = arg2;

      if (key === "imagem" && value instanceof File) {
        const fr = new FileReader();
        fr.onload = (ev) => {
          setFormData((prev) => ({ ...prev, imagem: ev.target.result }));
        };
        fr.readAsDataURL(value);
        return;
      }

      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  // ---- Adicionar produto (mostra aqui e persiste na hora)
  const handleSubmit = (e) => {
    e.preventDefault();

    const nomeOK = formData.nome?.trim();
    const descOK = formData.descricao?.trim();
    const precoNum = Number(String(formData.preco).replace(",", "."));

    if (!nomeOK || !descOK || Number.isNaN(precoNum) || precoNum <= 0) {
      // aqui você pode disparar um toast/erro visual se quiser
      return;
    }

    const novoProduto = {
      ...formData,
      preco: precoNum,
      index: produtos.length,
      pausado: false,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const next = [...produtos, novoProduto];
    setProdutos(next);            // aparece na lista AQUI MESMO
    salvarProdutos(next);         // persiste imediatamente

    // limpa formulário (fica na mesma tela)
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      imagem: "",
      categoria: "",
      pausado: false,
    });
  };

  // ---- Editar produto (com persistência síncrona)
  const handleEditar = (index, atualizado) => {
    setProdutos((prev) => {
      const next = prev.map((p, i) =>
        i === index
          ? {
              ...p,
              ...atualizado,
              index: i,
              preco: Number(String(atualizado.preco ?? p.preco).replace(",", ".")),
            }
          : p
      );
      salvarProdutos(next);
      return next;
    });
  };

  // ---- Deletar
  const handleDeletar = (index) => {
    setProdutos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Reindex opcional (mantém index consistente)
      const reindexed = next.map((p, i) => ({ ...p, index: i }));
      salvarProdutos(reindexed);
      return reindexed;
    });
  };

  // ---- Pausar
  const handlePausar = (index) => {
    setProdutos((prev) => {
      const next = prev.map((p, i) =>
        i === index ? { ...p, pausado: !p.pausado } : p
      );
      salvarProdutos(next);
      return next;
    });
  };

  // ---- Agrupar por categoria para a Lista
  const categoriasAgrupadas = produtos.reduce((acc, produto) => {
    const cat = produto.categoria || "Sem categoria";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(produto);
    return acc;
  }, {});

  return (
    <div className="container-tw">
      {/* Formulário principal (cadastrar novo produto) */}
      <ProdutoForm
        formData={formData}
        indiceEdicao={null}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {/* Lista de produtos (já aparece aqui imediatamente) */}
      <ListaProdutos
        categoriasAgrupadas={categoriasAgrupadas}
        onEditar={handleEditar}
        onDeletar={handleDeletar}
        onPausar={handlePausar}
      />
    </div>
  );
}
