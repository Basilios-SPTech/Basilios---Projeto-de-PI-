import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";

export default function PixQRCode() {
  const [imageBlob, setImageBlob] = useState(null);

  const sanitizeQRCode = (qrCode) => {
    if (!qrCode) return null;

    // Bloqueia protocolos perigosos
    if (
      qrCode.startsWith("javascript:") ||
      qrCode.startsWith("data:text/") ||
      qrCode.startsWith("vbscript:")
    ) {
      console.warn("QR Code inválido detectado");
      return null;
    }

    // Aceita apenas data:image base64
    if (qrCode.startsWith("data:image/")) {
      // Valida estrutura do base64
      const [header, data] = qrCode.split(",");
      if (data && /^[A-Za-z0-9+/=]+$/.test(data)) {
        return qrCode;
      }
    }

    return null;
  };

  // useEffect(() => {
  //   const url = URL.createObjectURL(img);
  //   console.log(base64Image);
  //   console.log(img);
  //   console.log(url);
  //   setImageBlob(url);
  // }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
        <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>QR Code PIX</span>
      </h3>

      <div className="flex justify-center items-center p-2 sm:p-4">
        <img
          src={sanitizeQRCode(localStorage.getItem("qrCode"))}
          alt="QR Code PIX"
          className="w-full max-w-[250px] sm:max-w-[280px] md:max-w-[300px] h-auto border-4 border-gray-100 rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}
