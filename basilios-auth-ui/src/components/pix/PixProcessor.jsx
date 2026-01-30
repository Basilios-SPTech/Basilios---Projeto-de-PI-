import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import PixQRCode from "./PixQRCode";
import PixCode from "./PixCode";
import PixInstructions from "./PixInstructions";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PixProcessor({ pixData }) {
  // pixData -> tem que vir do response do POST que vamos fazer, e ai passamos alguns atributos como props pra outros componetes
  const [decodedBrCode, setDecodedBrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const simulatePayment = async () => {
    const body = {
      metadata: {},
    };
    const response = await axios.post(
      `/api/abacate/v1/pixQrCode/simulate-payment?id=${localStorage.getItem("pixId")}`,
      body,
      {
        headers: {
          Authorization: "Bearer abc_dev_J24NemeHukwqGwfe2bj63G2q",
          "Content-Type": "application/json",
        },
      },
    );
    console.log(response.data.data);
    if (response.data.data.status == "PAID") {
      console.log("pagoo");
      localStorage.removeItem("carrinho-basilios");
      navigate("/order-status");
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

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
            <p className="text-sm sm:text-base text-blue-700">
              Processando QR Code...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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
          className="w-full sm:w-auto sm:min-w-[280px] bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer mt-6 sm:mt-10 transition-colors flex items-center justify-center mx-auto text-sm sm:text-base touch-manipulation shadow-md hover:shadow-lg"
          onClick={simulatePayment}
        >
          Simular Pagamento
        </button>
      </div>
    </div>
  );
}
