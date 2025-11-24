import { QrCode } from "lucide-react";

export default function PixQRCode({ base64Image }) {
  if (!base64Image) return null;

  const decodeBase64 = (base64Image) => {};

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5" />
        QR Code PIX
      </h3>
      <div className="flex justify-center">
        <img
          src={base64Image}
          alt="QR Code PIX"
          className="max-w-full h-auto border-4 border-gray-100 rounded-lg"
          style={{ maxHeight: "300px" }}
        />
      </div>
    </div>
  );
}
