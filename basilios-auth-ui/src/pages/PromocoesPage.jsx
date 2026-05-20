// src/pages/PromocoesPage.jsx
import { useState, useEffect } from "react";
import DateTimePicker from "../components/DateTimePicker.jsx";
import { Plus, Edit2, Trash2, X, DollarSign, Calendar } from "lucide-react";
import { http } from "../services/http.js";
import toast from "react-hot-toast";
import "../styles/promocoes.css";
import MenuButton from "../components/MenuButtonAdm.jsx";
import { resolveImageUrl } from "../utils/imageUrl.js";

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

  // Atualizar status a cada minuto para verificar se promoções expiraram
  useEffect(() => {
    const intervalo = setInterval(() => {
      carregarPromocoes();
    }, 60000); // 60 segundos

    return () => clearInterval(intervalo);
  }, []);

  // Forçar re-render a cada segundo para atualizar status em tempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      // Força re-render sem chamar API novamente
      setPromocoes([...promocoes]);
    }, 1000); // 1 segundo

    return () => clearInterval(intervalo);
  }, [promocoes]);

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
        startDate: normalizePromoDateTime(promo.startDate),
        endDate: normalizePromoDateTime(promo.endDate),
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

  const handleDateChange = (name, value) => {
    const nextValue = String(value || "");
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const parseDateTimeLocal = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;

    const safe = String(value).replace(" ", "T");
    const [datePart, timePart = ""] = safe.split("T");
    const [year, month, day] = datePart.split("-").map(Number);

    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }

    const [hour = "0", minute = "0"] = timePart.split(":");
    const hh = Number(hour) || 0;
    const mm = Number(minute) || 0;

    return new Date(year, month - 1, day, hh, mm);
  };

  const formatDateTimeLocal = (date) => {
    if (!(date instanceof Date)) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  const normalizePromoDateTime = (value) => {
    if (!value) return "";
    
    const str = String(value).trim();
    
    // Extrair apenas a parte de data/hora: YYYY-MM-DDTHH:mm
    // Remove timezone offset ou milissegundos se existirem
    const match = str.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    return match ? match[1] : "";
  };

  const convertToISO8601 = (datetimeLocalValue) => {
    if (!datetimeLocalValue) return "";
    // datetime-local vem no formato: 2026-05-04T10:00
    // Converter para: 2026-05-04T10:00:00 (ISO 8601 com hora)
    const [date, time] = datetimeLocalValue.split("T");
    if (!time) return "";
    
    // Retorna como ISO string com segundos
    return `${date}T${time}:00`;
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

    const startDateParsed = parseDateTimeLocal(formData.startDate);
    const endDateParsed = parseDateTimeLocal(formData.endDate);
    if (startDateParsed && endDateParsed && startDateParsed >= endDateParsed) {
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
        startDate: convertToISO8601(formData.startDate),
        endDate: convertToISO8601(formData.endDate),
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

    return resolveImageUrl(produto.imageUrl, {
      fallback: produto.image || produto.imagem || "",
    });
  };

  const getProdutoPreco = (productId) => {
    const produto = produtos.find((p) => p.id === productId);
    return produto?.price ?? produto?.preco ?? 0;
  };

  const calcularPrecoComDesconto = (precoOrigin, desconto) => {
    return (toSafeMoney(precoOrigin) - toSafeMoney(desconto)).toFixed(2);
  };

  const parsePromoDate = (dateString) => {
    if (!dateString) return new Date(0);
    
    const str = String(dateString).trim();
    
    // Se vem com 'Z' no final, é UTC - converter para local
    if (str.endsWith("Z")) {
      return new Date(str);
    }
    
    // Se tem offset de timezone (ex: +03:00 ou -03:00), deixar o Date parse normalmente
    if (str.match(/[+-]\d{2}:\d{2}$/)) {
      return new Date(str);
    }
    
    // Se é apenas data/hora sem timezone, tratar como local
    // Formato: 2026-05-04T20:32:00
    return new Date(str);
  };

  const formatPromoDateTime = (dateString) => {
    if (!dateString) return "";
    const date = parsePromoDate(dateString);
    
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");
    
    return `${dia}/${mes}/${ano} às ${hora}:${minutos}`;
  };

  const isPromoAtiva = (promo) => {
    if (!promo.isActive) return false;
    
    const agora = new Date();
    const dataInicio = parsePromoDate(promo.startDate);
    const dataFim = parsePromoDate(promo.endDate);
    
    return agora >= dataInicio && agora < dataFim;
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

  const startDateValue = parseDateTimeLocal(formData.startDate);
  const endDateValue = parseDateTimeLocal(formData.endDate);
  const hasInvalidDateRange =
    !!startDateValue && !!endDateValue && startDateValue >= endDateValue;

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
                          <span className="value value--discount">
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
                      {formatPromoDateTime(promo.startDate)} até{" "}
                      {formatPromoDateTime(promo.endDate)}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Status:</span>
                    <span className={`badge ${isPromoAtiva(promo) ? "badge--active" : "badge--inactive"}`}>
                      {isPromoAtiva(promo) ? "Ativa" : "Inativa"}
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
                  {produtos
                    .sort((a, b) => {
                      const nameA = (a.name || a.nome).toLowerCase();
                      const nameB = (b.name || b.nome).toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    .map((p) => (
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
                <DateTimePicker
                  value={formData.startDate}
                  onChange={(value) => handleDateChange("startDate", value)}
                  enableTime={true}
                  maxDate={formData.endDate || undefined}
                  disabled={loading}
                  inputClassName={`form-input ${hasInvalidDateRange ? "form-input--invalid" : ""}`}
                  placeholder="Selecione a data"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Data de Término
                </label>
                <DateTimePicker
                  value={formData.endDate}
                  onChange={(value) => handleDateChange("endDate", value)}
                  enableTime={true}
                  minDate={formData.startDate || undefined}
                  disabled={loading}
                  inputClassName={`form-input ${hasInvalidDateRange ? "form-input--invalid" : ""}`}
                  placeholder="Selecione a data"
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
