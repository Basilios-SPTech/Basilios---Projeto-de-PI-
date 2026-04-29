// src/pages/CadastrarProduto.jsx

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProdutoForm from "../components/ProdutoForm.jsx";
import MenuButton from "../components/MenuButtonAdm.jsx";
import SidebarAdm from "../components/SidebarAdm.jsx";
import CategoryManager from "../components/CategoryManager.jsx";
import {
  criarProduto,
  listarProdutos,
  atualizarProduto,
  deletarProduto,
  atualizarStatusProduto,
} from "../services/produtosApi.js";

import { http } from "../services/http.js";

const CHAVE_STORAGE = "produtos-basilios";
const CHAVE_CATEGORIAS_STORAGE = "categorias-basilios";
const CHAVE_SUBCATEGORIAS_STORAGE = "subcategorias-basilios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const DEFAULT_CATEGORIES = [
  { label: "Lanches / Hambúrguer", value: "BURGER" },
  { label: "Combo / Promoção", value: "COMBO" },
  { label: "Acompanhamento / Side", value: "SIDE" },
  { label: "Bebidas", value: "DRINK" },
  { label: "Sobremesa", value: "DESSERT" },
];

const DEFAULT_SUBCATEGORIES = {
  BURGER: [
    { value: "BEEF", label: "Carne Bovina" },
    { value: "CHICKEN", label: "Frango" },
    { value: "PORK", label: "Porco" },
    { value: "FISH", label: "Peixe" },
    { value: "VEGETARIAN", label: "Vegetariano" },
    { value: "VEGAN", label: "Vegano" },
  ],
  SIDE: [
    { value: "FRIES", label: "Batata Frita" },
    { value: "ONION_RINGS", label: "Onion Rings" },
    { value: "SALAD", label: "Salada" },
    { value: "NUGGETS", label: "Nuggets" },
  ],
  DRINK: [
    { value: "SODA", label: "Refrigerante" },
    { value: "JUICE", label: "Suco" },
    { value: "MILKSHAKE", label: "Milkshake" },
    { value: "BEER", label: "Cerveja" },
    { value: "WATER", label: "Água" },
  ],
  DESSERT: [
    { value: "SODA", label: "Refrigerante" },
    { value: "JUICE", label: "Suco" },
    { value: "MILKSHAKE", label: "Milkshake" },
    { value: "BEER", label: "Cerveja" },
    { value: "WATER", label: "Água" },
  ],
  COMBO: [],
};

const ADICIONAL_SUBCATEGORIES = [
  { value: "QUEIJO", label: "Queijo" },
  { value: "PROTEINA", label: "Proteina" },
  { value: "BACON", label: "Bacon" },
  { value: "OVO", label: "Ovo" },
  { value: "MOLHO", label: "Molho" },
  { value: "VEGETAL", label: "Vegetal" },
  { value: "ACOMPANHAMENTO", label: "Acompanhamento" },
  { value: "BEBIDA", label: "Bebida" },
  { value: "PAO", label: "Pão" },
  { value: "OUTRO", label: "Outro" },
];

function getLabelToEnumMap(subcategories) {
  const map = {};
  Object.entries(subcategories).forEach(([category, options]) => {
    options.forEach(({ value, label }) => {
      map[label] = value;
    });
  });
  return map;
}

function normalizeAdicionalSubcategory(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const match = ADICIONAL_SUBCATEGORIES.find(
    (opt) =>
      opt.value === raw ||
      String(opt.label).toLowerCase() === raw.toLowerCase(),
  );

  if (match) return match.value;

  return raw
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

// Extrai URL relativa do upload (remove baseURL se contiver)
function extractRelativeImageUrl(fullUrl) {
  if (!fullUrl) return null;
  // Se contém o baseURL completo, remove e deixa só a parte relativa
  if (fullUrl.includes(API_BASE)) {
    return fullUrl.replace(API_BASE, '');
  }
  // Se já é relativa, retorna como está
  return fullUrl;
}

export default function CadastrarProduto() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState(DEFAULT_CATEGORIES);
  const [subcategorias, setSubcategorias] = useState(DEFAULT_SUBCATEGORIES);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ingrediente: "",
    preco: "",
    categoria: "",
    subcategoria: "",
    imagem: "",
    imagemArquivo: null,
  });

  const [indiceEdicao, setIndiceEdicao] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [adicionais, setAdicionais] = useState([]);
  const [adicionaisLoading, setAdicionaisLoading] = useState(false);
  const [adicionaisError, setAdicionaisError] = useState("");
  const [adicionaisListOpen, setAdicionaisListOpen] = useState(true);
  const [adicionalForm, setAdicionalForm] = useState({
    id: null,
    name: "",
    description: "",
    subcategory: "",
    price: "",
  });
  const [editAdicionalForm, setEditAdicionalForm] = useState({
    id: null,
    name: "",
    description: "",
    subcategory: "",
    price: "",
  });
  const [isEditAdicionalOpen, setIsEditAdicionalOpen] = useState(false);
  const [adicionalToDelete, setAdicionalToDelete] = useState(null);
  const [produtoToDelete, setProdutoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Carrega categorias personalizadas do localStorage
    try {
      const categoriasLocal = JSON.parse(
        localStorage.getItem(CHAVE_CATEGORIAS_STORAGE) || "[]"
      );
      if (Array.isArray(categoriasLocal) && categoriasLocal.length > 0) {
        setCategorias([...DEFAULT_CATEGORIES, ...categoriasLocal]);
      }
    } catch (err) {
      console.error("Erro ao carregar categorias do localStorage:", err);
    }

    // Carrega subcategorias personalizadas do localStorage
    try {
      const subcategoriasLocal = JSON.parse(
        localStorage.getItem(CHAVE_SUBCATEGORIAS_STORAGE) || "{}"
      );
      setSubcategorias({ ...DEFAULT_SUBCATEGORIES, ...subcategoriasLocal });
    } catch (err) {
      console.error("Erro ao carregar subcategorias do localStorage:", err);
    }
  }, []);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const data = await listarProdutos(false);

        const adaptados = (data || []).map((p, index) => ({
          index: p.id ?? index,
          nome: p.name ?? p.nome ?? "",
          descricao: p.description ?? p.descricao ?? "",
          preco: p.price ?? p.preco ?? 0,
          categoria: p.category ?? p.categoria ?? "",
          subcategoria: p.subcategory ?? p.subcategoria ?? "",
          pausado: p.isPaused ?? p.paused ?? false,
          imagem: p.imageUrl ? `${API_BASE}${p.imageUrl}` : p.imagem || "",
          imageUrl: p.imageUrl || "", // Preserva a URL relativa do backend
        }));

        setProdutos(adaptados);
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(adaptados));
      } catch (err) {
        console.error("💥 Erro ao carregar produtos no cadastro:", err);

        try {
          const salvo = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || "[]");
          setProdutos(Array.isArray(salvo) ? salvo : []);
        } catch {
          setProdutos([]);
        }
      }
    }

    carregarProdutos();
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(produtos));
  }, [produtos]);

  async function loadAdicionais() {
    setAdicionaisLoading(true);
    setAdicionaisError("");

    try {
      const size = 100;
      let page = 0;
      let last = false;
      let all = [];

      while (!last && page < 20) {
        const { data } = await http.get("/adicionais", {
          params: { page, size },
        });

        const content = Array.isArray(data) ? data : data?.content || [];
        all = all.concat(content);

        if (Array.isArray(data)) {
          last = true;
        } else {
          last = Boolean(data?.last) || content.length < size;
        }

        page += 1;
      }

      setAdicionais(all);
    } catch (err) {
      console.error("Erro ao carregar adicionais:", err);
      setAdicionais([]);
      setAdicionaisError(err?.message || "Erro ao carregar adicionais.");
    } finally {
      setAdicionaisLoading(false);
    }
  }

  useEffect(() => {
    loadAdicionais();
  }, []);

  function formatPriceInput(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";

    const padded = digits.padStart(3, "0");
    const integer = padded.slice(0, -2).replace(/^0+(?=\d)/, "");
    const decimal = padded.slice(-2);

    return `${integer || "0"},${decimal}`;
  }

  useEffect(() => {
    if (!isEditAdicionalOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeEditAdicional();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditAdicionalOpen]);

  useEffect(() => {
    if (!adicionalToDelete && !produtoToDelete) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) {
        setAdicionalToDelete(null);
        setProdutoToDelete(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adicionalToDelete, produtoToDelete, isDeleting]);

  function handleAdicionalChange(e) {
    if (!e?.target) return;
    const { name, value } = e.target;
    setAdicionalForm((prev) => ({
      ...prev,
      [name]: name === "price" ? formatPriceInput(value) : value,
    }));
  }

  function resetAdicionalForm() {
    setAdicionalForm({
      id: null,
      name: "",
      description: "",
      subcategory: "",
      price: "",
    });
  }

  function resetEditAdicionalForm() {
    setEditAdicionalForm({
      id: null,
      name: "",
      description: "",
      subcategory: "",
      price: "",
    });
  }

  async function handleAdicionalSubmit(e) {
    e.preventDefault();

    const name = String(adicionalForm.name || "").trim();
    const description = String(adicionalForm.description || "").trim();
    const subcategory = normalizeAdicionalSubcategory(adicionalForm.subcategory);
    const parsedPrice = Number(String(adicionalForm.price || "").replace(",", "."));

    if (!name || !subcategory) {
      toast.error("Preencha nome e subcategoria do adicional.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Preco do adicional invalido.");
      return;
    }

    const payload = {
      name,
      description,
      subcategory,
      price: parsedPrice,
    };

    try {
      await http.post("/adicionais", payload);
      toast.success("Adicional criado com sucesso.");

      resetAdicionalForm();
      setAdicionaisListOpen(false);
      await loadAdicionais();
    } catch (err) {
      console.error("Erro ao salvar adicional:", err);
      toast.error(err?.message || "Nao foi possivel salvar o adicional.");
    }
  }

  function handleEditAdicionalChange(e) {
    if (!e?.target) return;
    const { name, value } = e.target;
    setEditAdicionalForm((prev) => ({
      ...prev,
      [name]: name === "price" ? formatPriceInput(value) : value,
    }));
  }

  function openEditAdicional(adicional) {
    if (!adicional) return;
    setEditAdicionalForm({
      id: adicional.id,
      name: adicional.name || "",
      description: adicional.description || "",
      subcategory: normalizeAdicionalSubcategory(adicional.subcategory || ""),
      price: formatPriceInput(adicional.price),
    });
    setIsEditAdicionalOpen(true);
  }

  function closeEditAdicional() {
    setIsEditAdicionalOpen(false);
    resetEditAdicionalForm();
  }

  async function handleEditAdicionalSubmit(e) {
    e.preventDefault();

    const id = Number(editAdicionalForm.id);
    const name = String(editAdicionalForm.name || "").trim();
    const description = String(editAdicionalForm.description || "").trim();
    const subcategory = normalizeAdicionalSubcategory(editAdicionalForm.subcategory);
    const parsedPrice = Number(String(editAdicionalForm.price || "").replace(",", "."));

    if (!id || !name || !subcategory) {
      toast.error("Preencha nome e subcategoria do adicional.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Preco do adicional invalido.");
      return;
    }

    const payload = {
      name,
      description,
      subcategory,
      price: parsedPrice,
    };

    try {
      await http.patch(`/adicionais/${id}`, payload);
      toast.success("Adicional atualizado com sucesso.");

      closeEditAdicional();
      setAdicionaisListOpen(false);
      await loadAdicionais();
    } catch (err) {
      console.error("Erro ao atualizar adicional:", err);
      toast.error(err?.message || "Nao foi possivel atualizar o adicional.");
    }
  }

  async function handleDeletarAdicional(adicional) {
    if (!adicional?.id) return;
    setAdicionalToDelete(adicional);
  }

  async function confirmDeleteAdicional() {
    if (!adicionalToDelete?.id || isDeleting) return;

    setIsDeleting(true);
    try {
      await http.delete(`/adicionais/${adicionalToDelete.id}`);
      toast.success("Adicional deletado.");
      setAdicionalToDelete(null);
      await loadAdicionais();
    } catch (err) {
      console.error("Erro ao deletar adicional:", err);
      toast.error(err?.message || "Nao foi possivel deletar o adicional.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleChange(e) {
    if (!e?.target) return;

    const { id, name, value, files, type, checked } = e.target;
    const key = id || name;

    // upload de imagem
    if (key === "imagem") {
      const file = files?.[0] || null;

      if (!file) {
        setFormData((prev) => ({
          ...prev,
          imagem: "",
          imagemArquivo: null,
        }));
        return;
      }

      const fr = new FileReader();
      fr.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          imagem: ev.target.result,
          imagemArquivo: file,
        }));
      };
      fr.readAsDataURL(file);
      return;
    }

    if (key === "categoria") {
      setFormData((prev) => ({
        ...prev,
        categoria: value,
        subcategoria: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? !!checked : value,
    }));
  }

  function handleAddCategory(novaCat) {
    setCategorias((prev) => {
      const atualizado = [...prev, novaCat];
      // Salva no localStorage (só a parte personalizada)
      const personalizadas = atualizado.filter(
        (c) => !DEFAULT_CATEGORIES.some((dc) => dc.value === c.value)
      );
      localStorage.setItem(
        CHAVE_CATEGORIAS_STORAGE,
        JSON.stringify(personalizadas)
      );
      return atualizado;
    });
  }

  function handleAddSubcategory(categoria, novaSubcat) {
    setSubcategorias((prev) => {
      const atualizado = {
        ...prev,
        [categoria]: [...(prev[categoria] || []), novaSubcat],
      };
      // Salva no localStorage (só a parte personalizada)
      const personalizadas = {};
      Object.entries(atualizado).forEach(([cat, opts]) => {
        if (!DEFAULT_SUBCATEGORIES.hasOwnProperty(cat)) {
          personalizadas[cat] = opts;
        } else {
          const optsNaoDefault = opts.filter(
            (opt) =>
              !DEFAULT_SUBCATEGORIES[cat].some((dopt) => dopt.value === opt.value)
          );
          if (optsNaoDefault.length > 0) {
            personalizadas[cat] = optsNaoDefault;
          }
        }
      });
      localStorage.setItem(
        CHAVE_SUBCATEGORIAS_STORAGE,
        JSON.stringify(personalizadas)
      );
      return atualizado;
    });
  }

  function clearForm() {
    setIndiceEdicao(null);
    setFormData({
      nome: "",
      descricao: "",
      ingrediente: "",
      preco: "",
      categoria: "",
      subcategoria: "",
      imagem: "",
      imagemArquivo: null,
    });
  }

  function parsePreco(str) {
    const num = Number(String(str).replace(",", "."));
    if (Number.isNaN(num) || num < 0) return null;
    return Number(num.toFixed(2));
  }

  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();

    if (!formData.nome?.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }

    const precoNum = parsePreco(formData.preco);
    if (precoNum === null) {
      toast.error("Preço inválido.");
      return;
    }

    if (!formData.categoria) {
      toast.error("Selecione uma categoria válida.");
      return;
    }

    const subOpts = subcategorias[formData.categoria] || [];
    if (subOpts.length > 0 && !formData.subcategoria) {
      toast.error("Selecione uma subcategoria.");
      return;
    }

    // EDIÇÃO
    if (indiceEdicao !== null) {
      try {
        let imageUrl = null;

        // se usuário trocou o arquivo, faz upload de novo
        if (formData.imagemArquivo) {
          const fd = new FormData();
          fd.append("file", formData.imagemArquivo);

          const respUpload = await http.post("/api/upload/image", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          imageUrl = extractRelativeImageUrl(respUpload.data); // Extrai apenas /uploads/...
        }

        const dtoUpdate = {
          name: formData.nome.trim(),
          description: formData.descricao.trim(),
          price: precoNum,
          category: formData.categoria || null,
          subcategory: formData.subcategoria || null,
          tags: [],
          ingredientes: formData.ingrediente
            ? formData.ingrediente
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          ingredientsDetailed: [],
          ...(imageUrl ? { imageUrl } : {}),
        };

        const atualizadoBack = await atualizarProduto(indiceEdicao, dtoUpdate);

        const imagemAtual =
          atualizadoBack.imageUrl
            ? `${API_BASE}${atualizadoBack.imageUrl}`
            : produtos.find((p) => p.index === indiceEdicao)?.imagem ||
              formData.imagem ||
              "";

        const atualizadoLocal = {
          index: atualizadoBack.id ?? indiceEdicao,
          nome: atualizadoBack.name ?? formData.nome,
          descricao: atualizadoBack.description ?? formData.descricao,
          preco:
            atualizadoBack.finalPrice ??
            atualizadoBack.price ??
            precoNum,
          categoria: atualizadoBack.category ?? formData.categoria,
          subcategoria:
            (atualizadoBack.subcategory ?? formData.subcategoria) || "",
          pausado: atualizadoBack.isPaused ?? !!formData.pausado,
          imagem: imagemAtual,
          imageUrl: atualizadoBack.imageUrl || "", // Preserva URL relativa
        };

        setProdutos((prev) =>
          prev.map((p) => (p.index === indiceEdicao ? atualizadoLocal : p))
        );

        setIndiceEdicao(null);
        setModalOpen(false);
        clearForm();
      } catch (err) {
        console.error("Erro ao atualizar produto:", err);
        toast.error("Não foi possível atualizar o produto.");
      }

      return;
    }

    // CRIAÇÃO
    try {
      let imageUrl = null;

      if (formData.imagemArquivo) {
        const fd = new FormData();
        fd.append("file", formData.imagemArquivo);

        const respUpload = await http.post("/api/upload/image", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrl = extractRelativeImageUrl(respUpload.data); // Extrai apenas /uploads/...
      }

      const dto = {
        name: formData.nome.trim(),
        description: formData.descricao.trim(),
        price: precoNum,
        category: formData.categoria || null,
        subcategory: formData.subcategoria || null,
        tags: [],
        ingredientes: formData.ingrediente
          ? formData.ingrediente
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        ingredientsDetailed: [],
        imageUrl,
      };

      const produtoCriadoDoBack = await criarProduto(dto);

      const novoProdutoLocal = {
        index: produtoCriadoDoBack.id,
        nome: produtoCriadoDoBack.name,
        descricao: produtoCriadoDoBack.description,
        preco: produtoCriadoDoBack.price,
        categoria:
          produtoCriadoDoBack.category ?? produtoCriadoDoBack.categoria,
        subcategoria:
          produtoCriadoDoBack.subcategory ?? produtoCriadoDoBack.subcategoria,
        pausado:
          produtoCriadoDoBack.paused ??
          produtoCriadoDoBack.isPaused ??
          false,
        imagem: produtoCriadoDoBack.imageUrl
          ? `${API_BASE}${produtoCriadoDoBack.imageUrl}`
          : formData.imagem || "",
        imageUrl: produtoCriadoDoBack.imageUrl || "", // Preserva URL relativa
      };

      setProdutos((prev) => [novoProdutoLocal, ...prev]);
      clearForm();
      toast.success("Produto criado com sucesso!");
    } catch (err) {
      const payload = err?.response?.data ?? err?.message ?? "Erro desconhecido";
      console.error("Erro ao criar produto:", err);
      const msg = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
      toast.error(msg);
    }
  }

  function handleCancel() {
    clearForm();
  }

  function handleEditar(produto) {
    setIndiceEdicao(produto.index);

    setFormData({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      ingrediente: produto.ingrediente || "",
      preco: produto.preco || "",
      categoria: produto.categoria || "",
      subcategoria: produto.subcategoria || "",
      imagem: produto.imagem || "",
      imagemArquivo: null,
    });

    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    clearForm();
  }

  async function handleDeletar(produto) {
    if (!produto?.index) return;
    setProdutoToDelete(produto);
  }

  async function confirmDeleteProduto() {
    if (!produtoToDelete?.index || isDeleting) return;

    setIsDeleting(true);
    try {
      await deletarProduto(produtoToDelete.index);
      setProdutos((prev) => prev.filter((p) => p.index !== produtoToDelete.index));
      setProdutoToDelete(null);
    } catch (err) {
      console.error("Erro ao deletar produto:", err);
      toast.error("Não foi possível deletar o produto.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handlePausar(index) {
    const alvo = produtos.find((p) => p.index === index);
    if (!alvo) return;

    try {
      const novoStatus = !alvo.pausado;

      console.log(`🔄 Alterando status do produto ${index} para isPaused=${novoStatus}`);
      const atualizadoBack = await atualizarStatusProduto(index, novoStatus);
      console.log("✅ Resposta do backend:", atualizadoBack);

      const imagemAtual = alvo.imagem || "";

      const atualizadoLocal = {
        index: atualizadoBack.id,
        nome: atualizadoBack.name ?? alvo.nome,
        descricao: atualizadoBack.description ?? alvo.descricao,
        preco: atualizadoBack.finalPrice ?? atualizadoBack.price ?? alvo.preco,
        categoria: atualizadoBack.category ?? alvo.categoria,
        subcategoria: atualizadoBack.subcategory ?? alvo.subcategoria,
        pausado: atualizadoBack.isPaused ?? novoStatus,
        imagem: imagemAtual,
        imageUrl: atualizadoBack.imageUrl ?? alvo.imageUrl,
      };

      setProdutos((prev) =>
        prev.map((p) => (p.index === index ? atualizadoLocal : p))
      );

      toast.success(
        atualizadoLocal.pausado ? "Produto pausado!" : "Produto retomado!"
      );
    } catch (err) {
      console.error("❌ Erro ao alterar status do produto:", err);
      toast.error("Não foi possível alterar o status do produto.");
    }
  }

  const previewPreco =
    formData.preco !== "" &&
    !isNaN(Number(String(formData.preco).replace(",", ".")))
      ? Number(String(formData.preco).replace(",", ".")).toFixed(2)
      : "0,00";

  const produtosOrdenados = useMemo(
    () => [...produtos].sort((a, b) => Number(b.index) - Number(a.index)),
    [produtos]
  );

  const secoesPorCategoria = useMemo(() => {
    const map = new Map();
    for (const p of produtosOrdenados) {
      const cat = (p.categoria || "").trim() || "Sem categoria";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }
    return Array.from(map.entries());
  }, [produtosOrdenados]);

  const subcatOptions = subcategorias[formData.categoria] || [];
  const adicionaisOrdenados = useMemo(
    () => [...adicionais].sort((a, b) => (a?.name || "").localeCompare(b?.name || "")),
    [adicionais],
  );


  return (
    <div className="cp-page cp-page--no-header">
      <MenuButton />
      <main className="cp-grid">
        <div className="cp-left">
          <section className="cp-card cp-form">
            <ProdutoForm
              formData={formData}
              indiceEdicao={indiceEdicao}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              subcatOptions={subcatOptions}
              categorias={categorias}
            />

            <CategoryManager
              categories={categorias}
              subcategories={subcategorias}
              onAddCategory={handleAddCategory}
              onAddSubcategory={handleAddSubcategory}
            />
          </section>

          <section className="cp-card cp-preview cp-preview--inline">
            <h3>Pré-visualização</h3>

            <div className="cp-preview__card cp-preview__card--compact cp-preview__card--xs">
              <div className="cp-preview__media cp-preview__media--compact cp-preview__media--xs">
                {formData.imagem ? (
                  <img
                    src={formData.imagem}
                    alt="Pré-visualização do produto"
                  />
                ) : (
                  <div className="cp-preview__placeholder">Sem imagem</div>
                )}
              </div>

              <div className="cp-preview__body cp-preview__body--compact">
                <h4>{formData.nome || "Nome do produto"}</h4>

                <p className="cp-preview__desc">
                  {formData.descricao || "Descrição curta do produto..."}
                </p>

                <div
                  className="cp-preview__meta"
                  style={{
                    gap: ".5rem",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="cp-chip">
                    {formData.categoria || "Sem categoria"}
                  </span>

                  {formData.subcategoria ? (
                    <span className="cp-chip cp-chip--alt">
                      {formData.subcategoria}
                    </span>
                  ) : null}

                  <strong className="cp-price">R$ {previewPreco}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="cp-right">
          <section className="cp-card cp-ingredients">
            <div className="cp-ingredients__head">
              <h3>Cadastrar adicionais</h3>
            </div>


            <form className="cp-ingredients__form cp-form" onSubmit={handleAdicionalSubmit}>
              <div className="field-row">
                <label htmlFor="adicional-name" className="field-label">
                  Nome do adicional
                </label>
                <input
                  id="adicional-name"
                  name="name"
                  type="text"
                  className="input-base"
                  placeholder="Ex.: Extra Cheddar"
                  value={adicionalForm.name}
                  onChange={handleAdicionalChange}
                  required
                />
              </div>

              <div className="field-row">
                <label htmlFor="adicional-description" className="field-label">
                  Descrição (Opcional)
                </label>
                <input
                  id="adicional-description"
                  name="description"
                  type="text"
                  className="input-base"
                  placeholder="Ex.: Fatiado ou cremoso"
                  value={adicionalForm.description}
                  onChange={handleAdicionalChange}
                />
              </div>

              <div className="cp-ingredients__row">
                <div className="field-row">
                  <label htmlFor="adicional-subcategory" className="field-label">
                    Subcategoria
                  </label>
                  <select
                    id="adicional-subcategory"
                    name="subcategory"
                    className="input-base"
                    value={adicionalForm.subcategory}
                    onChange={handleAdicionalChange}
                    required
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {ADICIONAL_SUBCATEGORIES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-row">
                  <label htmlFor="adicional-price" className="field-label">
                    Preço (R$)
                  </label>
                  <input
                    id="adicional-price"
                    name="price"
                    type="text"
                    className="input-base"
                    placeholder="Ex.: 3,50"
                    inputMode="decimal"
                    value={adicionalForm.price}
                    onChange={handleAdicionalChange}
                    required
                  />
                </div>
              </div>

              <div className="cp-ingredients__actions">
                <button type="submit" className="btn btn-primary">
                  Salvar adicional
                </button>
              </div>
            </form>

            <div className="cp-ingredients__list-head">
              <div className="cp-ingredients__list-title">
                Lista de adicionais ({adicionaisOrdenados.length})
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setAdicionaisListOpen((prev) => !prev)}
              >
                {adicionaisListOpen ? "Recolher" : "Expandir"}
              </button>
            </div>

            {adicionaisListOpen && (
              <div className="cp-ingredients__list">
                {adicionaisLoading && (
                  <p className="cp-ingredients__status">Carregando adicionais...</p>
                )}

                {!adicionaisLoading && adicionaisError && (
                  <p className="cp-ingredients__status cp-ingredients__status--error">
                    {adicionaisError}
                  </p>
                )}

                {!adicionaisLoading && !adicionaisError && adicionaisOrdenados.length === 0 && (
                  <p className="cp-ingredients__status">Nenhum adicional cadastrado.</p>
                )}

                {!adicionaisLoading && !adicionaisError && adicionaisOrdenados.map((adicional) => (
                  <div key={adicional.id} className="cp-ingredients__item">
                    <div className="cp-ingredients__info">
                      <h4>{adicional.name}</h4>
                      {adicional.description && (
                        <p>{adicional.description}</p>
                      )}
                      <div className="cp-ingredients__meta">
                        <span className="cp-chip cp-chip--alt">
                          {adicional.subcategory || "OUTRO"}
                        </span>
                        <span className="cp-ingredients__price">
                          R$ {Number(adicional.price || 0).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                    <div className="cp-ingredients__item-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => openEditAdicional(adicional)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleDeletarAdicional(adicional)}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </main>

      {isEditAdicionalOpen && (
        <div
          className="cp-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={closeEditAdicional}
          onKeyDown={(e) => e.key === "Enter" && closeEditAdicional()}
          aria-label="Fechar modal"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="cp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cp-modal__header">
              <h4>Editar adicional</h4>
              <button
                type="button"
                className="cp-modal__close"
                onClick={closeEditAdicional}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="cp-modal__body">
              <form onSubmit={handleEditAdicionalSubmit}>
                <div className="field-row">
                  <label htmlFor="edit-adicional-name">Nome do adicional</label>
                  <input
                    id="edit-adicional-name"
                    name="name"
                    type="text"
                    placeholder="Ex.: Extra Cheddar"
                    value={editAdicionalForm.name}
                    onChange={handleEditAdicionalChange}
                    required
                    autoFocus
                  />
                </div>

                <div className="field-row">
                  <label htmlFor="edit-adicional-description">Descrição (Opcional)</label>
                  <input
                    id="edit-adicional-description"
                    name="description"
                    type="text"
                    placeholder="Ex.: Fatiado ou cremoso"
                    value={editAdicionalForm.description}
                    onChange={handleEditAdicionalChange}
                  />
                </div>

                <div className="cp-ingredients__row">
                  <div className="field-row">
                    <label htmlFor="edit-adicional-subcategory">Subcategoria</label>
                    <select
                      id="edit-adicional-subcategory"
                      name="subcategory"
                      value={editAdicionalForm.subcategory}
                      onChange={handleEditAdicionalChange}
                      required
                    >
                      <option value="" disabled>
                        Selecione...
                      </option>
                      {ADICIONAL_SUBCATEGORIES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-row">
                    <label htmlFor="edit-adicional-price">Preço (R$)</label>
                    <input
                      id="edit-adicional-price"
                      name="price"
                      type="text"
                      placeholder="Ex.: 3,50"
                      inputMode="decimal"
                      value={editAdicionalForm.price}
                      onChange={handleEditAdicionalChange}
                      required
                    />
                  </div>
                </div>

                <div className="cp-modal__footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEditAdicional}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Atualizar adicional
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <section className="cp-list-wrap">
        <div className="cp-list-head">
          <h2>Produtos cadastrados</h2>
          <p className="cp-muted">
            Seus itens aparecem por categoria. Você pode editar, pausar e
            excluir.
          </p>
        </div>

        {secoesPorCategoria.length === 0 ? (
          <div className="cp-empty">
            <p>Nenhum produto ainda. Cadastre seu primeiro item!</p>
          </div>
        ) : (
          secoesPorCategoria.map(([categoria, itens]) => (
            <div className="cp-cat-section" key={categoria}>
              <h3 className="cp-cat-title">{categoria}</h3>

              <div className="cp-list">
                {itens.map((p) => (
                  <article
                    key={p.index}
                    className={`product-card ${
                      p.pausado ? "is-paused" : ""
                    }`}
                  >
                    <div className="product-media">
                      {p.imagem ? (
                        <img src={p.imagem} alt={p.nome || "Produto"} />
                      ) : (
                        <div className="product-placeholder">Sem imagem</div>
                      )}

                      {p.pausado && (
                        <span className="product-badge">Pausado</span>
                      )}
                    </div>

                    <div className="product-body">
                      <h3 className="product-title">
                        {p.nome || "Sem nome"}
                      </h3>

                      <p className="product-desc">
                        {p.descricao || "—"}
                      </p>

                      <div
                        className="product-meta"
                        style={{
                          gap: ".5rem",
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="cp-chip">
                          {p.categoria || "Sem categoria"}
                        </span>

                        {p.subcategoria ? (
                          <span className="cp-chip cp-chip--alt">
                            {p.subcategoria}
                          </span>
                        ) : null}

                        <strong className="cp-price">
                          R$ {p.preco || "0.00"}
                        </strong>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleEditar(p)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-ghost"
                        onClick={() => handleDeletar(p)}
                      >
                        Deletar
                      </button>

                      <button
                        className="btn btn-ghost"
                        onClick={() => handlePausar(p.index)}
                      >
                        {p.pausado ? "Retomar" : "Pausar"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {modalOpen && (
        <div className="cp-modal-overlay" role="button" tabIndex={0} onClick={handleCloseModal} onKeyDown={(e) => e.key === "Enter" && handleCloseModal()} aria-label="Fechar modal">
          <div
            role="dialog"
            aria-modal="true"
            className="cp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cp-modal__body">
              <ProdutoForm
                formData={formData}
                indiceEdicao={indiceEdicao}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                subcatOptions={subcatOptions}
                showCloseButton={true}
              />
            </div>
          </div>
        </div>
      )}

      {(adicionalToDelete || produtoToDelete) && (
        <div
          className="cp-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isDeleting) {
              setAdicionalToDelete(null);
              setProdutoToDelete(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isDeleting) {
              setAdicionalToDelete(null);
              setProdutoToDelete(null);
            }
          }}
          aria-label="Fechar modal"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="cp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cp-modal__header">
              <h4>Confirmar exclusão</h4>
              <button
                type="button"
                className="cp-modal__close"
                onClick={() => {
                  if (!isDeleting) {
                    setAdicionalToDelete(null);
                    setProdutoToDelete(null);
                  }
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="cp-modal__body">
              <p>
                {adicionalToDelete
                  ? `Deseja apagar o adicional "${adicionalToDelete.name}"?`
                  : `Deseja apagar o produto "${produtoToDelete?.nome || "Produto"}"?`}
              </p>

              <div className="cp-modal__footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (!isDeleting) {
                      setAdicionalToDelete(null);
                      setProdutoToDelete(null);
                    }
                  }}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (adicionalToDelete) {
                      confirmDeleteAdicional();
                      return;
                    }
                    confirmDeleteProduto();
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
