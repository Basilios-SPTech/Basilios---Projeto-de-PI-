import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PromotionModal({ product, isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setTitle(product.nome || "");
      setDescription("");
      setDiscountAmount("");
      setDiscountPercentage("");
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen, product]);

  // Calcula a porcentagem automaticamente quando o desconto em reais muda
  useEffect(() => {
    if (discountAmount && product?.preco) {
      const percentage = ((parseFloat(discountAmount) / product.preco) * 100).toFixed(2);
      setDiscountPercentage(percentage);
    } else {
      setDiscountPercentage("");
    }
  }, [discountAmount, product?.preco]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !discountAmount || !startDate || !endDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Data de término deve ser após data de início");
      return;
    }

    setLoading(true);

    try {
      // Converter para LocalDate (apenas a data, sem horas)
     const promotionData = {
  title,
  description,
  discountAmount: parseFloat(discountAmount), 
  startDate: startDate.split("T")[0],
  endDate: endDate.split("T")[0],
  productIds: [product.id], 
};

      console.log("Enviando promoção:", promotionData);

      await axios.post("http://localhost:8080/promotions", promotionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      toast.success("Promoção criada com sucesso!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao criar promoção:", err);
      const errorMsg = err.response?.data?.message || err.message || "Erro ao criar promoção";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">Adicionar Promoção</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Produto
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Lanche Premium"
                disabled={loading}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Promoção
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Promoção especial de fim de semana"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Preço Original */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Original
              </label>
              <input
                type="text"
                value={`R$ ${product?.preco?.toFixed(2).replace(".", ",")}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* Desconto em Reais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: 5.00"
                disabled={loading}
              />
            </div>

            {/* Desconto em Porcentagem (Calculado) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto (%)
              </label>
              <input
                type="text"
                value={discountPercentage ? `${discountPercentage}%` : ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                placeholder="Calculado automaticamente"
              />
            </div>

            {/* Data de Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              />
            </div>

            {/* Data de Término */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Término
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Criar Promoção"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
