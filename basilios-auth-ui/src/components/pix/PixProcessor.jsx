import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import PixQRCode from "./PixQRCode";
import PixCode from "./PixCode";
import PixInstructions from "./PixInstructions";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../loading/ProgressBar.jsx";
import { http } from "../../services/http.js";
import toast from "react-hot-toast";

const CHAVE_CART = "carrinho-basilios";
const PENDING_PIX_ORDER_KEY = "pending-pix-order";

export default function PixProcessor({ pixData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const navigate = useNavigate();

  // Função para verificar o status do PIX
  const checkPixStatus = async () => {
    const pixId = localStorage.getItem("pixId");
    const orderId = localStorage.getItem("lastOrderId");

    if (!pixId || !orderId) return;

    try {
      const response = await fetch(
        `https://api.abacatepay.com/v1/pixQrCode/check?id=${pixId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer abc_dev_Xkmtb0HuqJrPW42uaNFDPSPd",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao verificar status do PIX");
      }

      const payload = await response.json();
      const pixStatus = payload?.data?.status;
      const externalId = payload?.data?.metadata?.externalId;
      
      console.log("Status do PIX:", pixStatus);

      // Se o status for diferente de PENDING, significa que houve mudança
      if (pixStatus !== "PENDING") {
        setIsPolling(false);
        
        // Fazer PATCH com o externalId
        try {
          await http.patch(`/orders/${orderId}`, {
            status: pixStatus,
            pixId: pixId,
            externalId: externalId,
          });
        } catch (err) {
          console.error("Erro ao atualizar pedido:", err);
          // Continua mesmo se falhar a atualização
        }

        if (pixStatus === "PAID") {
          toast.success("Pagamento confirmado! Redirecionando...");
        } else {
          toast.error(`Pagamento ${pixStatus}. Tente novamente.`);
        }
        
        // Limpar localStorage
        localStorage.removeItem(CHAVE_CART);
        localStorage.removeItem(PENDING_PIX_ORDER_KEY);
        localStorage.removeItem("pixId");
        localStorage.removeItem("brCodeBase64");
        localStorage.removeItem("brCode");
        localStorage.removeItem("pixOrderId");

        setTimeout(() => {
          navigate("/order-status");
        }, 2000);
      }
    } catch (err) {
      console.error("Erro ao verificar status do PIX:", err);
      setError(err?.message || "Erro ao verificar status do PIX");
    }
  };

  // Polling automático a cada 10 segundos
  useEffect(() => {
    const pixId = localStorage.getItem("pixId");
    
    if (!pixId) {
      setError("PIX não encontrado. Volte ao checkout e tente novamente.");
      return;
    }

    setIsPolling(true);
    
    // Fazer a primeira verificação imediatamente
    checkPixStatus();

    // Depois verificar a cada 10 segundos
    const interval = setInterval(checkPixStatus, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  const simulatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const pixId = localStorage.getItem("pixId");

      if (!pixId) {
        throw new Error("PIX não encontrado");
      }

      // Chamar endpoint de simulação do AbacatePay
      const response = await fetch(
        `/api/abacate/v1/pixQrCode/simulate-payment?id=${pixId}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer abc_dev_Xkmtb0HuqJrPW42uaNFDPSPd",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ metadata: {} }),
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao simular pagamento PIX");
      }

      const payload = await response.json();
      console.log("Simulação de pagamento:", payload?.data);

      // Aguardar um pouco e depois verificar o status
      setTimeout(() => {
        checkPixStatus();
      }, 1000);
    } catch (err) {
      console.error("Erro ao simular pagamento PIX:", err);
      setError(err?.message || "Erro ao simular pagamento PIX.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Pagamento PIX
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Escaneie o QR Code ou copie o código abaixo
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm sm:text-base text-red-700">{error}</p>
          </div>
        )}

        {/* Área de exibição dos resultados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <PixQRCode />
          <PixCode />
        </div>

        {/* Informações adicionais */}
        <PixInstructions />

        {/* Botão de simulação */}
        <button
          className="w-full sm:w-auto sm:min-w-[280px] bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer mt-6 sm:mt-10 transition-colors flex items-center justify-center mx-auto text-sm sm:text-base touch-manipulation shadow-md hover:shadow-lg disabled:opacity-50"
          onClick={simulatePayment}
          disabled={loading}
        >
          {loading ? "Processando..." : "Verificar Pagamento"}
        </button>

        {/* Status de polling */}
        {isPolling && (
          <div className="mt-4 sm:mt-6 text-center text-sm text-gray-600">
            <p>⏱️ Verificando status do pagamento a cada 10 segundos...</p>
          </div>
        )}
      </div>

      <ProgressBar visible={loading} />
    </div>
  );
}
