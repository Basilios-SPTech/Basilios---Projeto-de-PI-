import { Clock } from "lucide-react";

export default function OrderTime({ tempoEstimado }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6 text-white w-full">
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <Clock size={24} className="sm:w-8 sm:h-8 flex-shrink-0" />
        <h2 className="text-base sm:text-xl font-semibold">
          Tempo Estimado de Entrega
        </h2>
      </div>
      <p className="text-2xl sm:text-3xl font-bold ml-0 sm:ml-11">
        {tempoEstimado}
      </p>
    </div>
  );
}
