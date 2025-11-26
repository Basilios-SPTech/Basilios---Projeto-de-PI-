export default function PixInstructions() {
  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Instruções de Pagamento
      </h3>
      <ol className="space-y-2 text-gray-700">
        <li className="flex gap-2">
          <span className="font-semibold">1.</span>
          <span>Abra o app do seu banco</span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold">2.</span>
          <span>Escolha pagar via PIX</span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold">3.</span>
          <span>Escaneie o QR Code ou cole o código copiado</span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold">4.</span>
          <span>Confirme as informações e finalize o pagamento</span>
        </li>
      </ol>
    </div>
  );
}
