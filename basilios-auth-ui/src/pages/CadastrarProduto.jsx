// src/pages/CadastrarProduto.jsx

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProdutoForm from "../components/ProdutoForm.jsx";
import MenuButton from "../components/MenuButtonAdm.jsx";
import {
  criarProduto,
  listarProdutos,
  atualizarProduto,
  deletarProduto,
  atualizarStatusProduto,
} from "../services/produtosApi.js";

import { http } from "../services/http.js";
import { extractUploadImageUrl, resolveImageUrl } from "../utils/imageUrl.js";

const CHAVE_STORAGE = "produtos-basilios";
const BACKEND_CATEGORY_VALUES = [
  "BURGER",
  "SIDE",
  "DRINK",
  "DESSERT",
  "COMBO",
  "COMBOS_INDIVIDUAIS",
  "LANCHES_PREMIUM",
  "BEIRUTES",
  "HOT_DOG",
  "VEGANOS",
  "PORCOES",
  "SOBREMESAS",
  "BEBIDAS",
];

const DEFAULT_CATEGORIES = [
  { label: "Hambúrguer", value: "BURGER" },
  { label: "Acompanhamento", value: "SIDE" },
  { label: "Bebida", value: "DRINK" },
  { label: "Sobremesa", value: "DESSERT" },
  { label: "Combo", value: "COMBO" },
  { label: "Combos Individuais", value: "COMBOS_INDIVIDUAIS" },
  { label: "Lanches Premium", value: "LANCHES_PREMIUM" },
  { label: "Beirutes", value: "BEIRUTES" },
  { label: "Hot-dog", value: "HOT_DOG" },
  { label: "Veganos", value: "VEGANOS" },
  { label: "Porções", value: "PORCOES" },
  { label: "Sobremesas", value: "SOBREMESAS" },
  { label: "Bebidas", value: "BEBIDAS" },
];

const CATEGORY_LABEL_BY_VALUE = DEFAULT_CATEGORIES.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

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
  COMBOS_INDIVIDUAIS: [],
  LANCHES_PREMIUM: [],
  BEIRUTES: [],
  HOT_DOG: [],
  VEGANOS: [],
  PORCOES: [],
  SOBREMESAS: [],
  BEBIDAS: [],
};

const ADICIONAL_SUBCATEGORIES = [
  { value: "QUEIJO", label: "Queijo" },
  { value: "PROTEINA", label: "Proteína" },
  { value: "ACOMPANHAMENTO", label: "Acompanhamento" },
  { value: "BEBIDA", label: "Bebida" },
  { value: "PAO", label: "Pão" },
  { value: "VEGETAL", label: "Vegetal" },
  { value: "MOLHO", label: "Molho" },
];

const ADICIONAL_SUBCATEGORY_LABEL_MAP = ADICIONAL_SUBCATEGORIES.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {},
);

const ADICIONAL_SUBCATEGORY_ALIAS_MAP = {
  BACON: "PROTEINA",
  OVO: "PROTEINA",
  BEBIDAS: "BEBIDA",
  PAES: "PAO",
};

function normalizeAdicionalSubcategory(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const match = ADICIONAL_SUBCATEGORIES.find(
    (opt) =>
      opt.value === raw ||
      String(opt.label).toLowerCase() === raw.toLowerCase(),
  );

  if (match) return match.value;

  const normalized = raw
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  if (ADICIONAL_SUBCATEGORY_ALIAS_MAP[normalized]) {
    return ADICIONAL_SUBCATEGORY_ALIAS_MAP[normalized];
  }

  const isSupported = ADICIONAL_SUBCATEGORIES.some(
    (opt) => opt.value === normalized,
  );

  return isSupported ? normalized : "";
}

function normalizeSelectedAdicionalSubcategories(values) {
  if (!Array.isArray(values)) return [];

  const normalized = values
    .map((value) => normalizeAdicionalSubcategory(value))
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

function isAdicionalAtivo(adicional) {
  const active = adicional?.isActive ?? adicional?.active;
  if (typeof active === "boolean") return active;

  const paused = adicional?.isPaused ?? adicional?.paused;
  if (typeof paused === "boolean") return !paused;

  return true;
}

function formatFieldErrors(fieldErrors) {
  if (!fieldErrors || typeof fieldErrors !== "object") return "";

  const parts = Object.entries(fieldErrors).flatMap(([field, raw]) => {
    if (Array.isArray(raw)) {
      return raw.map((item) => `${field}: ${String(item)}`);
    }

    if (raw && typeof raw === "object") {
      if (typeof raw.message === "string") {
        return [`${field}: ${raw.message}`];
      }

      return Object.values(raw).map((item) => `${field}: ${String(item)}`);
    }

    if (raw == null) return [];
    return [`${field}: ${String(raw)}`];
  });

  return parts.join(" | ");
}

function getApiErrorMessage(err, fallbackMessage) {
  const data = err?.data ?? err?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  const fieldErrorsText = formatFieldErrors(data?.fieldErrors);
  if (fieldErrorsText) return fieldErrorsText;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.defaultMessage) return item.defaultMessage;
        if (item?.message) return item.message;
        return null;
      })
      .filter(Boolean)
      .join(" | ");
  }

  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  if (err?.message) return String(err.message);

  return fallbackMessage;
}

function getCategoryDisplayLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Sem categoria";

  const normalized = raw.toUpperCase();
  return CATEGORY_LABEL_BY_VALUE[normalized] || raw;
}

export default function CadastrarProduto() {
  const [produtos, setProdutos] = useState([]);
  const categorias = DEFAULT_CATEGORIES;
  const subcategorias = DEFAULT_SUBCATEGORIES;
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [savingProductStatus, setSavingProductStatus] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
    subcategoria: "",
    adicionalSubcategories: [],
    imageUrl: "",
    imagem: "",
    imagemArquivo: null,
  });

  const [indiceEdicao, setIndiceEdicao] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [adicionais, setAdicionais] = useState([]);
  const [adicionaisLoading, setAdicionaisLoading] = useState(false);
  const [adicionaisError, setAdicionaisError] = useState("");
  const [adicionaisListOpen, setAdicionaisListOpen] = useState(true);
  const [adicionalSubcategoryFilter, setAdicionalSubcategoryFilter] = useState("ALL");
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
  const [categoriaFiltro, setCategoriaFiltro] = useState("ALL");
  const [statusFiltro, setStatusFiltro] = useState("ALL");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await listarProdutos(false, 0, 100);
        const produtosData = Array.isArray(response)
          ? response
          : response?.content || [];

        const adaptados = produtosData.map((p, index) => ({
          index: p.id ?? index,
          nome: p.name ?? p.nome ?? "",
          descricao: p.description ?? p.descricao ?? "",
          preco: p.price ?? p.preco ?? 0,
          categoria: p.category ?? p.categoria ?? "",
          subcategoria: p.subcategory ?? p.subcategoria ?? "",
          adicionalSubcategories: normalizeSelectedAdicionalSubcategories(
            p.adicionalSubcategories ?? p.additionalSubcategories,
          ),
          pausado: p.isPaused ?? p.paused ?? false,
          imagem: resolveImageUrl(p.imageUrl, { fallback: p.imagem || "" }),
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
          imageUrl: "",
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

    if (key === "preco") {
      setFormData((prev) => ({
        ...prev,
        preco: formatPriceInput(value),
      }));
      return;
    }

    if (key === "adicionalSubcategories" && type === "checkbox") {
      const normalized = normalizeAdicionalSubcategory(value);
      if (!normalized) return;

      setFormData((prev) => {
        const current = normalizeSelectedAdicionalSubcategories(
          prev.adicionalSubcategories,
        );

        const next = checked
          ? Array.from(new Set([...current, normalized]))
          : current.filter((item) => item !== normalized);

        return {
          ...prev,
          adicionalSubcategories: next,
        };
      });

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? !!checked : value,
    }));
  }

  function clearForm() {
    setIndiceEdicao(null);
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      categoria: "",
      subcategoria: "",
      adicionalSubcategories: [],
      imageUrl: "",
      imagem: "",
      imagemArquivo: null,
    });
  }

  function handleToggleAllAdicionalSubcategories() {
    setFormData((prev) => ({
      ...prev,
      adicionalSubcategories:
        Array.isArray(prev.adicionalSubcategories) &&
        prev.adicionalSubcategories.length === ADICIONAL_SUBCATEGORIES.length
          ? []
          : ADICIONAL_SUBCATEGORIES.map((item) => item.value),
    }));
  }

  function parsePreco(str) {
    const num = Number(String(str).replace(",", "."));
    if (Number.isNaN(num) || num < 0) return null;
    return Number(num.toFixed(2));
  }

  async function optimizeImageForUpload(file) {
    if (!(file instanceof File)) return file;
    if (!String(file.type || "").startsWith("image/")) return file;

    const lowerType = String(file.type || "").toLowerCase();
    if (lowerType.includes("gif") || lowerType.includes("svg")) {
      return file;
    }

    const maxBytes = 900 * 1024;
    if (file.size <= maxBytes) return file;

    const loadImage = (rawFile) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(rawFile);
      });

    try {
      const image = await loadImage(file);

      const maxEdge = 1600;
      const width = image.width || 0;
      const height = image.height || 0;

      if (!width || !height) return file;

      const scale = Math.min(1, maxEdge / Math.max(width, height));
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

      const outputType =
        lowerType.includes("jpeg") || lowerType.includes("jpg") || lowerType.includes("webp")
          ? file.type
          : "image/jpeg";

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, outputType, 0.82);
      });

      if (!blob || blob.size >= file.size) return file;

      const newName = outputType === "image/jpeg"
        ? file.name.replace(/\.[^.]+$/, "") + ".jpg"
        : file.name;

      return new File([blob], newName, {
        type: outputType,
        lastModified: Date.now(),
      });
    } catch {
      return file;
    }
  }

  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();

    if (isSavingProduct) {
      return;
    }

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

    if (!BACKEND_CATEGORY_VALUES.includes(formData.categoria)) {
      toast.error("Categoria não suportada pelo backend.");
      return;
    }

    const backendSubOpts = DEFAULT_SUBCATEGORIES[formData.categoria] || [];
    const isSubcategoryAllowedByBackend =
      backendSubOpts.length === 0 ||
      backendSubOpts.some((opt) => opt.value === formData.subcategoria);

    if (!isSubcategoryAllowedByBackend) {
      toast.error("Subcategoria inválida para a categoria selecionada.");
      return;
    }

    const subOpts = subcategorias[formData.categoria] || [];
    if (subOpts.length > 0 && !formData.subcategoria) {
      toast.error("Selecione uma subcategoria.");
      return;
    }

    const selectedAdicionalSubcategories = normalizeSelectedAdicionalSubcategories(
      formData.adicionalSubcategories,
    );

    if (selectedAdicionalSubcategories.length > 0) {
      const availableSubcategories = new Set(
        adicionais
          .filter((adicional) => isAdicionalAtivo(adicional))
          .map((adicional) => normalizeAdicionalSubcategory(adicional?.subcategory))
          .filter(Boolean),
      );

      const missingSubcategories = selectedAdicionalSubcategories.filter(
        (subcategory) => !availableSubcategories.has(subcategory),
      );

      if (missingSubcategories.length > 0) {
        const labels = missingSubcategories
          .map((subcategory) => ADICIONAL_SUBCATEGORY_LABEL_MAP[subcategory] || subcategory)
          .join(", ");

        toast.error(`Não há adicionais ativos para: ${labels}.`);
        return;
      }
    }

    // EDIÇÃO
    if (indiceEdicao !== null) {
      setIsSavingProduct(true);
      setSavingProductStatus(
        formData.imagemArquivo
          ? "Enviando imagem para o servidor..."
          : "Salvando alterações do produto...",
      );

      try {
        let imageUrl = null;

        // se usuário trocou o arquivo, faz upload de novo
        if (formData.imagemArquivo) {
          const optimizedFile = await optimizeImageForUpload(formData.imagemArquivo);
          const fd = new FormData();
          fd.append("file", optimizedFile);

          const respUpload = await http.post("/api/upload/image", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          imageUrl = extractUploadImageUrl(respUpload.data?.url ?? respUpload.data);

          if (!imageUrl) {
            throw new Error("Upload da imagem sem URL válida.");
          }
        }

        const resolvedImageUrl = imageUrl || formData.imageUrl || null;
        const resolvedSubcategory = String(formData.subcategoria || "").trim() || null;

        const dtoUpdate = {
          name: formData.nome.trim(),
          description: formData.descricao.trim(),
          imageUrl: resolvedImageUrl,
          category: formData.categoria,
          subcategory: resolvedSubcategory,
          price: precoNum,
          adicionalSubcategories: selectedAdicionalSubcategories,
        };

        console.info("[CadastrarProduto] Payload atualizar", dtoUpdate);
        setSavingProductStatus("Salvando alterações do produto...");

        const atualizadoBack = await atualizarProduto(indiceEdicao, dtoUpdate);

        const imagemAtual =
          atualizadoBack.imageUrl
            ? resolveImageUrl(atualizadoBack.imageUrl)
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
          adicionalSubcategories: normalizeSelectedAdicionalSubcategories(
            atualizadoBack.adicionalSubcategories ??
              atualizadoBack.additionalSubcategories ??
              selectedAdicionalSubcategories,
          ),
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
        console.error("Erro ao atualizar produto:", {
          error: err,
          status: err?.status,
          data: err?.data,
          method: err?.method,
          url: err?.url,
          requestData: err?.requestData,
        });
        toast.error(getApiErrorMessage(err, "Não foi possível atualizar o produto."));
      } finally {
        setIsSavingProduct(false);
        setSavingProductStatus("");
      }

      return;
    }

    // CRIAÇÃO
    setIsSavingProduct(true);
    setSavingProductStatus(
      formData.imagemArquivo
        ? "Enviando imagem para o servidor..."
        : "Salvando novo produto...",
    );

    try {
      let imageUrl = null;

      if (formData.imagemArquivo) {
        const optimizedFile = await optimizeImageForUpload(formData.imagemArquivo);
        const fd = new FormData();
        fd.append("file", optimizedFile);

        const respUpload = await http.post("/api/upload/image", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrl = extractUploadImageUrl(respUpload.data?.url ?? respUpload.data);

        if (!imageUrl) {
          throw new Error("Upload da imagem sem URL válida.");
        }
      }

      const resolvedSubcategory = String(formData.subcategoria || "").trim() || null;

      const dto = {
        name: formData.nome.trim(),
        description: formData.descricao.trim(),
        category: formData.categoria,
        subcategory: resolvedSubcategory,
        price: precoNum,
        adicionalSubcategories: selectedAdicionalSubcategories,
        ...(imageUrl ? { imageUrl } : {}),
      };

      console.info("[CadastrarProduto] Payload criar", dto);
      setSavingProductStatus("Salvando novo produto...");

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
        adicionalSubcategories: normalizeSelectedAdicionalSubcategories(
          produtoCriadoDoBack.adicionalSubcategories ??
            produtoCriadoDoBack.additionalSubcategories ??
            selectedAdicionalSubcategories,
        ),
        pausado:
          produtoCriadoDoBack.paused ??
          produtoCriadoDoBack.isPaused ??
          false,
        imagem: produtoCriadoDoBack.imageUrl
          ? resolveImageUrl(produtoCriadoDoBack.imageUrl)
          : formData.imagem || "",
        imageUrl: produtoCriadoDoBack.imageUrl || "", // Preserva URL relativa
      };

      setProdutos((prev) => [novoProdutoLocal, ...prev]);
      clearForm();
      toast.success("Produto criado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar produto:", {
        error: err,
        status: err?.status,
        data: err?.data,
        method: err?.method,
        url: err?.url,
        requestData: err?.requestData,
      });
      toast.error(getApiErrorMessage(err, "Erro ao criar produto."));
    } finally {
      setIsSavingProduct(false);
      setSavingProductStatus("");
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
      preco:
        produto.preco === 0 || produto.preco
          ? formatPriceInput(produto.preco)
          : "",
      categoria: produto.categoria || "",
      subcategoria: produto.subcategoria || "",
      adicionalSubcategories: normalizeSelectedAdicionalSubcategories(
        produto.adicionalSubcategories,
      ),
      imageUrl: produto.imageUrl || "",
      imagem: produto.imagem || "",
      imagemArquivo: null,
    });

    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isSavingProduct) return;
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
        adicionalSubcategories: normalizeSelectedAdicionalSubcategories(
          atualizadoBack.adicionalSubcategories ??
            atualizadoBack.additionalSubcategories ??
            alvo.adicionalSubcategories,
        ),
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

  const categoriasFiltroOptions = useMemo(() => {
    const unique = new Set();

    for (const p of produtosOrdenados) {
      const cat = (p.categoria || "").trim() || "Sem categoria";
      unique.add(cat);
    }

    return Array.from(unique).sort((a, b) =>
      getCategoryDisplayLabel(a).localeCompare(getCategoryDisplayLabel(b), "pt-BR")
    );
  }, [produtosOrdenados]);

  const produtosFiltrados = useMemo(() => {
    return produtosOrdenados.filter((p) => {
      const categoria = (p.categoria || "").trim() || "Sem categoria";

      if (categoriaFiltro !== "ALL" && categoria !== categoriaFiltro) {
        return false;
      }

      if (statusFiltro === "ACTIVE" && !!p.pausado) {
        return false;
      }

      if (statusFiltro === "PAUSED" && !p.pausado) {
        return false;
      }

      return true;
    });
  }, [produtosOrdenados, categoriaFiltro, statusFiltro]);

  const secoesPorCategoria = useMemo(() => {
    const map = new Map();
    for (const p of produtosFiltrados) {
      const cat = (p.categoria || "").trim() || "Sem categoria";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }
    return Array.from(map.entries());
  }, [produtosFiltrados]);

  const subcatOptions = subcategorias[formData.categoria] || [];
  const adicionaisOrdenados = useMemo(
    () => [...adicionais].sort((a, b) => (a?.name || "").localeCompare(b?.name || "")),
    [adicionais],
  );
  const adicionaisFiltrados = useMemo(() => {
    if (adicionalSubcategoryFilter === "ALL") {
      return adicionaisOrdenados;
    }

    return adicionaisOrdenados.filter((adicional) => {
      const subcategory = normalizeAdicionalSubcategory(adicional?.subcategory);
      return subcategory === adicionalSubcategoryFilter;
    });
  }, [adicionaisOrdenados, adicionalSubcategoryFilter]);

  const additionalSubcategoryLabelByValue = useMemo(() => {
    return ADICIONAL_SUBCATEGORIES.reduce((acc, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {});
  }, []);

  function getAdicionalSubcategoryLabel(value) {
    const normalized = normalizeAdicionalSubcategory(value);
    if (!normalized) return "Não informado";
    return additionalSubcategoryLabelByValue[normalized] || normalized;
  }

  function renderProductCard(p) {
    const linkedSubcategories = normalizeSelectedAdicionalSubcategories(
      p.adicionalSubcategories,
    );

    return (
      <article
        key={p.index}
        className={`product-card ${p.pausado ? "is-paused" : ""}`}
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
              {getCategoryDisplayLabel(p.categoria)}
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

          {linkedSubcategories.length > 0 && (
            <div className="product-linked-additions">
              <p className="product-linked-additions__title">Adicionais vinculados</p>
              <div className="product-linked-additions__chips">
                {linkedSubcategories.map((subcategory) => (
                  <span key={`${p.index}-${subcategory}`} className="cp-chip cp-chip--warn">
                    {ADICIONAL_SUBCATEGORY_LABEL_MAP[subcategory] || subcategory}
                  </span>
                ))}
              </div>
            </div>
          )}
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
    );
  }


  return (
    <div className="cp-page cp-page--no-header">
      <MenuButton />
      <main className="cp-grid">
        <div className="cp-left">
          <section className={`cp-card cp-form cp-saving-shell ${isSavingProduct ? "is-saving" : ""}`}>
            <ProdutoForm
              formData={formData}
              indiceEdicao={indiceEdicao}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onToggleAllAdicionalSubcategories={handleToggleAllAdicionalSubcategories}
              subcatOptions={subcatOptions}
              categorias={categorias}
              adicionalSubcategoryOptions={ADICIONAL_SUBCATEGORIES}
              isSaving={isSavingProduct}
              savingText={savingProductStatus}
            />

            {isSavingProduct && (
              <div className="cp-saving-overlay" role="status" aria-live="polite" aria-busy="true">
                <div className="cp-saving-overlay__content">
                  <span className="cp-saving-overlay__spinner" aria-hidden="true" />
                  <p className="cp-saving-overlay__title">Salvando produto</p>
                  <p className="cp-saving-overlay__text">{savingProductStatus || "Aguarde..."}</p>
                </div>
              </div>
            )}
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
                    {getCategoryDisplayLabel(formData.categoria)}
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
                    Categoria
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
                Lista de adicionais ({adicionaisFiltrados.length}
                {adicionalSubcategoryFilter !== "ALL" ? ` de ${adicionaisOrdenados.length}` : ""})
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
              <div className="cp-ingredients__list-wrap">
                <div className="cp-ingredients__filter-panel">
                  <div className="cp-ingredients__filter-title">Filtrar por categoria</div>
                  <div className="cp-ingredients__filter-row">
                    <label htmlFor="adicionais-filter" className="cp-ingredients__filter-label">
                      Opção de filtro selecionada:
                    </label>
                    <select
                      id="adicionais-filter"
                      className="input-base cp-ingredients__filter-select"
                      value={adicionalSubcategoryFilter}
                      onChange={(e) => setAdicionalSubcategoryFilter(e.target.value)}
                    >
                      <option value="ALL">Todas</option>
                      {ADICIONAL_SUBCATEGORIES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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

                  {!adicionaisLoading && !adicionaisError && adicionaisOrdenados.length > 0 && adicionaisFiltrados.length === 0 && (
                    <p className="cp-ingredients__status">Nenhum adicional encontrado para essa subcategoria.</p>
                  )}

                  {!adicionaisLoading && !adicionaisError && adicionaisFiltrados.map((adicional) => (
                    <div key={adicional.id} className="cp-ingredients__item">
                      <div className="cp-ingredients__info">
                        <h4>{adicional.name}</h4>
                        {adicional.description && (
                          <p>{adicional.description}</p>
                        )}
                        <div className="cp-ingredients__meta">
                          <span className="cp-chip cp-chip--alt">
                            {getAdicionalSubcategoryLabel(adicional.subcategory)}
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
                    <label htmlFor="edit-adicional-subcategory">Categoria</label>
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
          <div className="cp-list-head__top">
            <h2>Produtos cadastrados</h2>
            <div className="cp-list-filters">
              <div className="cp-list-filter">
                <label htmlFor="filtro-categoria-produtos">Categoria</label>
                <select
                  id="filtro-categoria-produtos"
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  <option value="ALL">Todas</option>
                  {categoriasFiltroOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryDisplayLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cp-list-filter">
                <label htmlFor="filtro-status-produtos">Status</label>
                <select
                  id="filtro-status-produtos"
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  <option value="ACTIVE">Não pausados</option>
                  <option value="PAUSED">Pausados</option>
                </select>
              </div>
            </div>
          </div>

          <p className="cp-muted">
            Seus itens aparecem por categoria. Você pode editar, pausar e
            excluir. Mostrando {produtosFiltrados.length} de {produtosOrdenados.length}.
          </p>
        </div>

        {secoesPorCategoria.length === 0 ? (
          <div className="cp-empty">
            <p>
              {produtosOrdenados.length === 0
                ? "Nenhum produto ainda. Cadastre seu primeiro item!"
                : "Nenhum produto encontrado com os filtros selecionados."}
            </p>
          </div>
        ) : (
          secoesPorCategoria.map(([categoria, itens]) => (
            <div className="cp-cat-section" key={categoria}>
              <div className="cp-cat-header">
                <h3 className="cp-cat-title">{getCategoryDisplayLabel(categoria)}</h3>
                <div className="cp-cat-header__line" aria-hidden="true" />
              </div>

              <div className="cp-list">
                {[...itens]
                  .sort((a, b) => {
                    if (!!a.pausado === !!b.pausado) {
                      return Number(b.index) - Number(a.index);
                    }
                    return Number(!!a.pausado) - Number(!!b.pausado);
                  })
                  .map((p) => renderProductCard(p))}
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
            <div className={`cp-modal__body cp-saving-shell ${isSavingProduct ? "is-saving" : ""}`}>
              <ProdutoForm
                formData={formData}
                indiceEdicao={indiceEdicao}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                onToggleAllAdicionalSubcategories={handleToggleAllAdicionalSubcategories}
                subcatOptions={subcatOptions}
                showCloseButton={true}
                categorias={categorias}
                adicionalSubcategoryOptions={ADICIONAL_SUBCATEGORIES}
                isSaving={isSavingProduct}
                savingText={savingProductStatus}
              />

              {isSavingProduct && (
                <div className="cp-saving-overlay" role="status" aria-live="polite" aria-busy="true">
                  <div className="cp-saving-overlay__content">
                    <span className="cp-saving-overlay__spinner" aria-hidden="true" />
                    <p className="cp-saving-overlay__title">Salvando produto</p>
                    <p className="cp-saving-overlay__text">{savingProductStatus || "Aguarde..."}</p>
                  </div>
                </div>
              )}
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
