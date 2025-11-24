import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function PixQRCode({ brCode }) {
  const [copied, setCopied] = useState(false);

  if (!brCode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Código PIX (Copia e Cola)
      </h3>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <p className="text-sm text-gray-700 break-all font-mono">{brCode}</p>
      </div>
      <button
        onClick={handleCopy}
        className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            Copiar Código PIX
          </>
        )}
      </button>
    </div>
  );
}
