import React from "react";
import { Plus, Minus, Trash2, Pencil } from "lucide-react"; // 👈 importa o Pencil também

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onEdit,
  onRemoveAdicional,
  onAddAdicional,
  onRemoveSauce,
  onAddSauce,
  onRemoveAdicionalAt,
  onRemoveSauceAt,
}) {
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
        {item.observation && (
          <span className="block text-xs text-gray-500 italic mt-1">
            Obs: {item.observation}
          </span>
        )}

        {/* Exibir contadores de adicionais e molhos (sem nomes) */}
        {Array.isArray(item.selectedIngredientNames) && item.selectedIngredientNames.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-700 mb-2">Adicionais selecionados:</p>
            <div className="flex flex-wrap gap-2">
              {item.selectedIngredientNames.map((name, idx) => (
                <div key={idx} className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{name}</span>
                  <button
                    onClick={() => onRemoveAdicionalAt?.(item.id, idx)}
                    className="ml-1 hover:bg-orange-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                    aria-label={`Remover adicional ${name}`}
                  >

                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(item.selectedSauceNames) && item.selectedSauceNames.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-700 mb-2">Molhos selecionados:</p>
            <div className="flex flex-wrap gap-2">
              {item.selectedSauceNames.map((name, idx) => (
                <div key={idx} className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{name}</span>
                  <button
                    onClick={() => onRemoveSauceAt?.(item.id, idx)}
                    className="ml-1 hover:bg-orange-600 rounded-full w-5 h-5 flex items-center justify-center"
                    aria-label={`Remover molho ${name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.meatPoint && item.meatPoint !== "médio" && (
          <span className="block text-xs text-gray-500 mt-1">
            Ponto da Carne: {item.meatPoint}
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
              className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(item)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-gray-700" />
            </button>


            <button
              onClick={() => onRemove(item.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
