import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";

export default function PixQRCode({ base64Image }) {
  const [imageBlob, setImageBlob] = useState(null);

  if (!base64Image) return null;

  const base64ToBlob = (base64) => {
    const parts = base64.split(",");
    const mime = parts[0].match(/:(.*?);/)[1];
    const bytes = atob(parts[1]);
    let len = bytes.length;

    const buffer = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      buffer[i] = bytes.charCodeAt(i);
    }

    return new Blob([buffer], { type: mime });
  };

  useEffect(() => {
    const img = base64ToBlob(base64Image);
    const url = URL.createObjectURL(img);

    console.log(base64Image);
    console.log(img);
    console.log(url);

    setImageBlob(url);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5" />
        QR Code PIX
      </h3>
      <div className="flex justify-center">
        <img
          src={imageBlob}
          alt="QR Code PIX"
          className="max-w-full h-auto border-4 border-gray-100 rounded-lg"
          style={{ maxHeight: "300px" }}
        />
      </div>
    </div>
  );
}
