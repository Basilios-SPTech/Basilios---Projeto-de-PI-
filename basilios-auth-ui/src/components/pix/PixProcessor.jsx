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
      navigate("/order-status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Pagamento PIX
          </h1>
          <p className="text-gray-600">
            Escaneie o QR Code ou copie o código abaixo
          </p>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-blue-700">Processando QR Code...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Área de exibição dos resultados */}
        <div className="grid md:grid-cols-2 gap-6">
          <PixQRCode />
          <PixCode />
        </div>

        {/* Informações adicionais */}
        <PixInstructions />

        <button
          className="bg-green-500 text-white rounded-xl p-3 cursor-pointer mt-10"
          onClick={simulatePayment}
        >
          Simular Pagamento
        </button>
      </div>
    </div>
  );
}
