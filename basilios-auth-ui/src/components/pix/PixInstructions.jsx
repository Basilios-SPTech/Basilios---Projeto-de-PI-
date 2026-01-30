export default function PixInstructions() {
  return (
    <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6 w-full max-w-2xl mx-auto">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        Instruções de Pagamento
      </h3>

      <ol className="space-y-2.5 sm:space-y-3 text-gray-700">
        <li className="flex gap-2 sm:gap-3">
          <span className="font-semibold text-red-600 min-w-[1.5rem] text-sm sm:text-base">
            1.
          </span>
          <span className="text-sm sm:text-base leading-relaxed">
            Abra o app do seu banco
          </span>
        </li>

        <li className="flex gap-2 sm:gap-3">
          <span className="font-semibold text-red-600 min-w-[1.5rem] text-sm sm:text-base">
            2.
          </span>
          <span className="text-sm sm:text-base leading-relaxed">
            Escolha pagar via PIX
          </span>
        </li>

        <li className="flex gap-2 sm:gap-3">
          <span className="font-semibold text-red-600 min-w-[1.5rem] text-sm sm:text-base">
            3.
          </span>
          <span className="text-sm sm:text-base leading-relaxed">
            Escaneie o QR Code ou cole o código copiado
          </span>
        </li>

        <li className="flex gap-2 sm:gap-3">
          <span className="font-semibold text-red-600 min-w-[1.5rem] text-sm sm:text-base">
            4.
          </span>
          <span className="text-sm sm:text-base leading-relaxed">
            Confirme as informações e finalize o pagamento
          </span>
        </li>
      </ol>
    </div>
  );
}
