import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function PixQRCode() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localStorage.getItem("brCode"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-2xl mx-auto">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        Código PIX (Copia e Cola)
      </h3>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 mb-3 sm:mb-4 max-h-32 sm:max-h-40 overflow-y-auto">
        <p className="text-xs sm:text-sm text-gray-700 break-all font-mono leading-relaxed">
          {localStorage.getItem("brCode")}
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="cursor-pointer w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Copiar Código PIX</span>
          </>
        )}
      </button>
    </div>
  );
}
