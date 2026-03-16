// src/pages/PromocoesPage.jsx
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Tag, FileText, DollarSign, Calendar } from "lucide-react";
import { http } from "../services/http.js";
import toast from "react-hot-toast";
import "../styles/promocoes.css";
import MenuButton from "../components/MenuButtonAdm.jsx";

export default function PromocoesPage() {
  const [promocoes, setPromocoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    productId: "",
    discountAmount: "",
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
      const response = await http.get("/promotions/current");
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
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
      const response = await http.get("/products");
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err.message);
    }
  }

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingId(promo.id);
      setFormData({
        title: promo.title || "",
        description: promo.description || "",
        productId: promo.productId || "",
        discountAmount: promo.discountAmount || "",
        startDate: promo.startDate ? promo.startDate.substring(0, 16) : "",
        endDate: promo.endDate ? promo.endDate.substring(0, 16) : "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        productId: "",
        discountAmount: "",
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
      title: "",
      description: "",
      productId: "",
      discountAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.productId || !formData.discountAmount || !formData.startDate || !formData.endDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("Data de término deve ser após data de início");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        productIds: [parseInt(formData.productId)],
        discountAmount: parseFloat(formData.discountAmount),
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

  return (
    <div className="promocoes-page">
      <MenuButton />
      
      <div className="promocoes-container">
        <div className="promocoes-header">
          <div>
            <h1>Promoções</h1>
            <p style={{ margin: "0.25rem 0 0 0", color: "#666", fontSize: "0.95rem" }}>
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
                <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</p>
                <p>Erro ao carregar promoções do servidor.</p>
                <p style={{ fontSize: "0.9rem", color: "#636e72", marginBottom: "1.5rem" }}>
                  O backend pode estar indisponível. Tente novamente em alguns instantes.
                </p>
                <button
                  onClick={() => carregarPromocoes()}
                  className="btn btn-primary"
                >
                  🔄 Tentar Novamente
                </button>
              </>
            ) : (
              <>
                <p>🎉 Nenhuma promoção cadastrada ainda.</p>
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

                <p className="promo-card__description">{promo.description}</p>

                <div className="promo-card__details">
                  <div className="detail">
                    <span className="label">Produto:</span>
                    <span className="value">{getProdutoNome(promo.productId)}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Desconto:</span>
                    <span className="value">R$ {promo.discountAmount?.toFixed(2).replace(".", ",")}</span>
                  </div>
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
                <p style={{ margin: "0.5rem 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
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
                  <Tag size={18} />
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Promoção de Verão"
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FileText size={18} />
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ex: Desconto especial em lanches premium"
                  rows={3}
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  🎁 Produto
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

              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={18} />
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  placeholder="Ex: 5.00"
                  disabled={loading}
                  className="form-input"
                />
              </div>

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
                  className="form-input"
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
                  className="form-input"
                />
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
                  disabled={loading}
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
