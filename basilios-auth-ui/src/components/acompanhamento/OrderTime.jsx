import { Clock } from "lucide-react";

export default function OrderTime({ tempoEstimado }) {
  return (
    <div className="bg-gray-700 rounded-lg p-6 shadow-md mb-6 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Clock size={32} />
        <h2 className="text-xl font-semibold">Tempo Estimado de Entrega</h2>
      </div>
      <p className="text-3xl font-bold">{tempoEstimado}</p>
    </div>
  );
}
