// src/pages/PromocoesPage.jsx
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, DollarSign, Calendar } from "lucide-react";
import { http } from "../services/http.js";
import toast from "react-hot-toast";
import "../styles/promocoes.css";
import MenuButton from "../components/MenuButtonAdm.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function PromocoesPage() {
  const [promocoes, setPromocoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    finalPrice: "",
    startDate: "",
    endDate: "",
  });

  // Carregar promoções e produtos
  useEffect(() => {
    carregarPromocoes();
    carregarProdutos();
  }, []);

  async function carregarPromocoes() {
    try {
      const response = await http.get("/promotions/current?page=0&size=100");
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.content || response.data?.data || []);
      setPromocoes(data);
      setErroCarregamento(false);
    } catch (err) {
      console.error("Erro ao carregar promoções:", err.message);
      setPromocoes([]);
      setErroCarregamento(true);
      if (err.status !== 500) {
        toast.error(`Erro ao carregar promoções: ${err.message}`);
      }
    }
  }

  async function carregarProdutos() {
    try {
      const response = await http.get("/products?page=0&size=1000");
      const payload = response.data;
      const data = Array.isArray(payload)
        ? payload
        : (payload?.content || payload?.items || payload?.data || []);
      setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err.message);
    }
  }

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingId(promo.id);
      setFormData({
        productId: promo.productId || "",
        finalPrice: promo.finalPrice || "",
        startDate: promo.startDate ? promo.startDate.substring(0, 16) : "",
        endDate: promo.endDate ? promo.endDate.substring(0, 16) : "",
      });
    } else {
      setEditingId(null);
      setFormData({
        productId: "",
        finalPrice: "",
        startDate: "",
        endDate: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      productId: "",
      finalPrice: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "finalPrice") {
      const digits = String(value || "").replace(/\D/g, "");
      const formatted = digits
        ? (Number(digits) / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "";

      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseCurrencyInput = (input) => {
    const normalized = String(input || "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "");

    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  };

  const parseMoneyValue = (value) => {
    const normalized = String(value ?? "")
      .replace(/\s/g, "")
      .replace(/R\$/gi, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "");

    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  };

  const toSafeMoney = (value) => {
    const n = parseMoneyValue(value);
    return Number.isFinite(n) ? n : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalPriceNum = parseCurrencyInput(formData.finalPrice);
    const precoProdutoSelecionado = parseMoneyValue(
      getProdutoPreco(parseInt(formData.productId))
    );

    if (!formData.productId || !formData.finalPrice || !formData.startDate || !formData.endDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!Number.isFinite(finalPriceNum) || finalPriceNum <= 0) {
      toast.error("Informe um preço final válido");
      return;
    }

    if (
      Number.isFinite(precoProdutoSelecionado) &&
      finalPriceNum > precoProdutoSelecionado
    ) {
      toast.error("O preço final não pode ser maior que o preço atual do produto");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("Data de término deve ser após data de início");
      return;
    }

    setLoading(true);

    try {
      const produtoSelecionado = produtos.find(p => p.id === parseInt(formData.productId));
      const precoOriginalRaw = produtoSelecionado?.price ?? produtoSelecionado?.preco ?? 0;
      const precoOriginal = parseMoneyValue(precoOriginalRaw);
      const desconto = precoOriginal - finalPriceNum;

      const payload = {
        title: produtoSelecionado?.name || produtoSelecionado?.nome || "",
        description: produtoSelecionado?.description || produtoSelecionado?.descricao || "",
        productIds: [parseInt(formData.productId)],
        discountAmount: desconto,
        finalPrice: finalPriceNum,
        startDate: formData.startDate.split("T")[0],
        endDate: formData.endDate.split("T")[0],
        isActive: true,
      };

      if (editingId) {
        await http.put(`/promotions/${editingId}`, payload);
        toast.success("Promoção atualizada com sucesso!");
      } else {
        await http.post("/promotions", payload);
        toast.success("Promoção criada com sucesso!");
      }

      carregarPromocoes();
      handleCloseModal();
    } catch (err) {
      console.error("Erro ao salvar promoção:", err);
      const errorMsg = err.response?.data?.message || err.message || "Erro ao salvar promoção";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar esta promoção?")) return;

    try {
      await http.delete(`/promotions/${id}`);
      toast.success("Promoção deletada com sucesso!");
      carregarPromocoes();
    } catch (err) {
      console.error("Erro ao deletar promoção:", err);
      toast.error("Erro ao deletar promoção");
    }
  };

  const getProdutoNome = (productId) => {
    const produto = produtos.find((p) => p.id === productId);
    return produto?.name || produto?.nome || "Produto desconhecido";
  };

  const getProdutoDescricao = (productId) => {
    const produto = produtos.find((p) => p.id === productId);
    return produto?.description || produto?.descricao || "";
  };

  const getProdutoImagem = (productId) => {
    const produto = produtos.find((p) => p.id === productId);
    if (!produto) return "";
    
    // Se vem como imageUrl, concatenar com API_BASE
    if (produto.imageUrl) {
      return `${API_BASE}${produto.imageUrl}`;
    }
    
    // Se vem como image ou imagem, retornar diretamente
    return produto.image || produto.imagem || "";
  };

  const getProdutoPreco = (productId) => {
    const produto = produtos.find((p) => p.id === productId);
    return produto?.price ?? produto?.preco ?? 0;
  };

  const calcularPrecoComDesconto = (precoOrigin, desconto) => {
    return (toSafeMoney(precoOrigin) - toSafeMoney(desconto)).toFixed(2);
  };

  const finalPricePreview = parseCurrencyInput(formData.finalPrice);
  const hasValidFinalPricePreview = Number.isFinite(finalPricePreview);
  const selectedProductPrice = formData.productId
    ? parseMoneyValue(getProdutoPreco(parseInt(formData.productId)))
    : NaN;
  const hasPriceAboveProduct =
    hasValidFinalPricePreview &&
    Number.isFinite(selectedProductPrice) &&
    finalPricePreview > selectedProductPrice;

  const hasInvalidDateRange =
    !!formData.startDate &&
    !!formData.endDate &&
    new Date(formData.startDate) >= new Date(formData.endDate);

  return (
    <div className="promocoes-page">
      <MenuButton />
      
      <div className="promocoes-container">
        <div className="promocoes-header">
          <div>
            <h1>Promoções</h1>
            <p className="promocoes-subtitle">
              Gerencie todas as promoções do Basilios
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary btn-add-promo"
          >
            <Plus size={20} />
            Adicionar Promoção
          </button>
        </div>

        {promocoes.length === 0 ? (
          <div className="empty-state">
            {erroCarregamento ? (
              <>
                <p className="empty-state__icon" aria-hidden="true">!</p>
                <p>Erro ao carregar promoções do servidor.</p>
                <p className="empty-state__hint">
                  O backend pode estar indisponível. Tente novamente em alguns instantes.
                </p>
                <button
                  onClick={() => carregarPromocoes()}
                  className="btn btn-primary"
                >
                  Tentar Novamente
                </button>
              </>
            ) : (
              <>
                <p>Nenhuma promoção cadastrada ainda.</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="btn btn-primary"
                >
                  Criar primeira promoção
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="promocoes-grid">
            {promocoes.map((promo) => (
              <div key={promo.id} className="promo-card">
                <div className="promo-card__header">
                  <h3>{promo.title}</h3>
                  <div className="promo-card__actions">
                    <button
                      onClick={() => handleOpenModal(promo)}
                      className="btn-icon"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="btn-icon btn-icon--danger"
                      title="Deletar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {getProdutoImagem(promo.productId) && (
                  <div className="promo-card__image-container">
                    <img 
                      src={getProdutoImagem(promo.productId)} 
                      alt={promo.title}
                      className="promo-card__image"
                    />
                  </div>
                )}

                <div className="promo-card__description-container">
                  {expandedCardId === promo.id ? (
                    <>
                      <p className="promo-card__description promo-card__description--expanded">
                        {promo.description}
                      </p>
                      <button
                        onClick={() => setExpandedCardId(null)}
                        className="btn-expand-description"
                      >
                        Ver menos
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="promo-card__description">
                        {promo.description.length > 120
                          ? promo.description.substring(0, 120) + "..."
                          : promo.description}
                      </p>
                      {promo.description.length > 120 && (
                        <button
                          onClick={() => setExpandedCardId(promo.id)}
                          className="btn-expand-description"
                        >
                          Ver mais
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="promo-card__details">
                  <div className="detail">
                    <span className="label">Produto:</span>
                    <span className="value">{getProdutoNome(promo.productId)}</span>
                  </div>
                  
                  {(() => {
                    const precoOriginal = getProdutoPreco(promo.productId);
                    const precoComDesconto = calcularPrecoComDesconto(precoOriginal, promo.discountAmount);
                    const precoOriginalNum = toSafeMoney(precoOriginal);
                    const descontoNum = toSafeMoney(promo.discountAmount);
                    return (
                      <>
                        <div className="detail">
                          <span className="label">Preço Original:</span>
                          <span className="value value--original">
                            R$ {precoOriginalNum.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Desconto:</span>
                          <span className="value value--discount" style={{ color: "#bb3530" }}>
                            − R$ {descontoNum.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Preço com Desconto:</span>
                          <span className="value value--final" style={{ color: "#1f7a3f" }}>
                            R$ {precoComDesconto.replace(".", ",")}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                  
                  <div className="detail">
                    <span className="label">Período:</span>
                    <span className="value">
                      {new Date(promo.startDate).toLocaleDateString("pt-BR")} até{" "}
                      {new Date(promo.endDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Status:</span>
                    <span className={`badge ${promo.isActive ? "badge--active" : "badge--inactive"}`}>
                      {promo.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>{editingId ? "Editar Promoção" : "Criar Nova Promoção"}</h2>
                <p className="modal__subtitle">
                  {editingId ? "Atualize os detalhes da promoção" : "Preencha os dados para criar uma nova promoção"}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="btn-close"
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal__form">
              <div className="form-group">
                <label className="form-label">
                  Produto
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="form-input"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.nome}
                    </option>
                  ))}
                </select>
              </div>

              {formData.productId && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      <DollarSign size={18} />
                      Preço Atual
                    </label>
                    <input
                      type="text"
                      value={`R$ ${toSafeMoney(getProdutoPreco(parseInt(formData.productId))).toFixed(2).replace(".", ",")}`}
                      disabled
                      className="form-input form-input--readonly"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <DollarSign size={18} />
                      Preço Final (com desconto)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="finalPrice"
                      value={formData.finalPrice}
                      onChange={handleInputChange}
                      placeholder="Ex: 20,00"
                      disabled={loading}
                      className={`form-input ${hasPriceAboveProduct ? "form-input--invalid" : ""}`}
                    />
                    {hasPriceAboveProduct && (
                      <p className="form-help form-help--error">
                        O preço final não pode ser maior que o preço atual.
                      </p>
                    )}
                    {formData.finalPrice && hasValidFinalPricePreview && (
                      <p className="form-help form-help--discount">
                        Desconto: R$ {(toSafeMoney(getProdutoPreco(parseInt(formData.productId))) - finalPricePreview).toFixed(2).replace(".", ",")}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Data de Início
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  max={formData.endDate || undefined}
                  className={`form-input ${hasInvalidDateRange ? "form-input--invalid" : ""}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Data de Término
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  min={formData.startDate || undefined}
                  className={`form-input ${hasInvalidDateRange ? "form-input--invalid" : ""}`}
                />
                {hasInvalidDateRange && (
                  <p className="form-help form-help--error">
                    A data de inicio precisa ser anterior a data de termino.
                  </p>
                )}
              </div>

              <div className="modal__footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || hasInvalidDateRange || hasPriceAboveProduct}
                  className="btn btn-primary"
                >
                  {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar Promoção"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
