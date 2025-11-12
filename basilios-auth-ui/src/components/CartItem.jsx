import React from "react";
import { Plus, Minus, Trash2, Pencil } from "lucide-react"; // 👈 importa o Pencil também

export default function CartItem({ item, onUpdateQuantity, onRemove, onEdit }) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Imagem do produto */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-xs">Sem imagem</span>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
        {item.description && (
          <span className="text-sm text-gray-600 mt-1 block">
            {item.description}
          </span>
        )}
        <p className="text-sm text-gray-600 mt-1">
          R$ {item.price.toFixed(2).replace(".", ",")}
        </p>

        {/* Quantidade e ações */}
        <div className="flex items-center gap-3 mt-3">
          {/* Controle de quantidade */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(item)} // 👈 só chama se for passado
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={() => onRemove(item.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Total do item */}
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
        </p>
      </div>
    </div>
  );
}
