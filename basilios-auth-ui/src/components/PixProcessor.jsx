import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import PixQRCode from "./PixQRCode";
import PixCode from "./PixCode";
import PixInstructions from "./PixInstructions";

export default function PixProcessor({ pixData }) {
  // pixData -> tem que vir do response do POST que vamos fazer, e ai passamos alguns atributos como props pra outros componetes
  const [decodedBrCode, setDecodedBrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultPixData = pixData || {
    brCodeBase64:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAABkklEQVR42uyYQY7DIAxFnVl6AY7AFTgCV+AI7tE9ugen9whetZIVGpMQJ1HVTpWvsgnY/G9jA8aOd7zjHe94x/8l/9Bz9Qu0Z9hqZY8yYxON9ghbLb+gbZbfkRv7CW2z/I7c2E9om+V35MZ+QtssN/YF7bPc2GfUy3Jjn1Ev63d2Qd0st/YZ9bJ+Z1fUzXJrn1Ev63d2Rd0st/YZ9bLeZlfUzfp+dkPdrO9nN9TN+n52Q92s72c31M36fmcX1Mv6ne2QO9shd7ZD7myH3NkOubMdcmc75M52yJ3tkDvbIXe2Q+5sh9zZDrmzHXJnO+TOdsid7ZA72yF3tkPubIfc2Q65sx1yZzvkznbIne2QO9shd7ZD7myH3NkOubMdcmc75M52yJ3tkDvbIXe2Q+5sh9zZDrmzHXJnO+TOdsid7ZA72yF3tkPubIfc2Q65sx1yZzvkznbIne2QO9shd7ZD7myH3NkOubMdcmc75M52yJ3tkDvbIXe2Q+5sh9zZDrmzHXJnO+TOdsidbdE+S9GeoW6W35Ab+wlts/yO3NhPaJvld+TGfkLbLD/2C/pv1xcxAZmHAAAAAElFTkSuQmCC",
    brCode:
      "00020101021226950014br.gov.bcb.pix2584www.example.com/pix/v2/cobv/9d36b84fc70b478fb95c12729b90ca255204000053039865802BR5913FULANO DE TAL6008BRASILIA62070503***6304B8C7",
  };

  const data = defaultPixData;

  const brCodeToDisplay = data.brCode || decodedBrCode;

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
        {(data.brCodeBase64 || brCodeToDisplay) && (
          <div className="grid md:grid-cols-2 gap-6">
            <PixQRCode base64Image={data.brCodeBase64} />
            <PixCode brCode={brCodeToDisplay} />
          </div>
        )}

        {/* Informações adicionais */}
        {brCodeToDisplay && <PixInstructions />}
      </div>
    </div>
  );
}
