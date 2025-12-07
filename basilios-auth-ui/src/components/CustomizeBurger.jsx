import React, { useState, useEffect } from "react";
import { X, Sliders, Minus, Plus } from "lucide-react";

export default function CustomizeBurger({ item, onClose, onSave }) {
  const [isOpen, setIsOpen] = useState(true);
  const [meatPoint, setMeatPoint] = useState("médio");

  // Ingredientes
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Presunto", desc: "Adicione presunto no seu lanche.", price: 4 },
    { id: 2, name: "Bacon", desc: "Bacon crocante em fatias generosas.", price: 5 },
    { id: 3, name: "Egg", desc: "Um ovo perfeito para completar seu lanche.", price: 4 },
    { id: 4, name: "Picles", desc: "Picles na medida certa, delicioso.", price: 4 },
    { id: 5, name: "Cheddar", desc: "Queijo cheddar derretido irresistível.", price: 5 },
    { id: 6, name: "Catupiry", desc: "Recheio cremoso de catupiry.", price: 5 },
    { id: 7, name: "Acebolado", desc: "Cebola dourada e saborosa.", price: 4 },
    { id: 8, name: "Vinagrete", desc: "Vinagrete fresquinho.", price: 4 },
    { id: 9, name: "Queijo", desc: "Queijo delicioso e derretido.", price: 4 },
  ]);

  // Bebidas
  const [drinks, setDrinks] = useState([
    { id: 1, name: "Coca Cola", price: 6.5 },
    { id: 2, name: "Coca Cola Zero", price: 6.5 },
    { id: 3, name: "Guaraná", price: 6.5 },
    { id: 4, name: "Guaraná Zero", price: 6.5 },
    { id: 5, name: "Pepsi", price: 6.5 },
    { id: 6, name: "Pepsi Twist", price: 6.5 },
    { id: 7, name: "Soda Limonada", price: 6.5 },
    { id: 8, name: "Citrus Schweppes", price: 6.5 },
  ]);

  // Pães
  const [breads, setBreads] = useState([
    { id: 1, name: "Pão de Gergelim", price: 4 },
    { id: 2, name: "Pão Australiano", price: 4 },
    { id: 3, name: "Pão de Brioche", price: 4 },
  ]);

  // Molhos extras
  const [saucesAvailable] = useState([
    { id: 1, name: "Maionese", desc: "100ml", price: 4 },
    { id: 2, name: "Tártaro", desc: "100ml", price: 4 },
    { id: 3, name: "Maionese de Alho", desc: "100ml", price: 4 },
  ]);

  const maxExtras = 5;
  const maxSauces = 2;

  // Arrays para armazenar IDs selecionados (permite duplicatas)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [selectedDrinkIds, setSelectedDrinkIds] = useState([]);
  const [selectedBreadId, setSelectedBreadId] = useState(null);
  const [selectedSauceIds, setSelectedSauceIds] = useState([]);

  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (item) {
      setQuantity(item.qtd || item.quantity || 1);
      setMeatPoint(item.meatPoint || "médio");
      setSelectedIngredientIds(item.selectedIngredientIds || []);
      setSelectedDrinkIds(item.selectedDrinkIds || []);
      setSelectedBreadId(item.selectedBreadId || null);
      setSelectedSauceIds(item.selectedSauceIds || []);
      setObservation(item.observation || "");
    }
  }, [item]);

  // Adicionar classe ao body quando o modal abrir/fechar para deslocar acessibilidade
  useEffect(() => {
    const body = document.body;
    if (!body) return;

    if (isOpen) {
      body.classList.add("customize-open");
    } else {
      body.classList.remove("customize-open");
    }

    return () => body.classList.remove("customize-open");
  }, [isOpen]);

  // Funções para adicionar/remover ingredientes (permite duplicatas)
  const addIngredient = (id) => {
    if (selectedIngredientIds.length < maxExtras) {
      setSelectedIngredientIds([...selectedIngredientIds, id]);
    }
  };

  const removeIngredient = (index) => {
    setSelectedIngredientIds(selectedIngredientIds.filter((_, i) => i !== index));
  };

  const addDrink = (id) => {
    setSelectedDrinkIds([...selectedDrinkIds, id]);
  };

  const removeDrink = (index) => {
    setSelectedDrinkIds(selectedDrinkIds.filter((_, i) => i !== index));
  };

  const selectBread = (id) => {
    setSelectedBreadId(selectedBreadId === id ? null : id);
  };

  const addSauce = (id) => {
    if (selectedSauceIds.length < maxSauces) {
      setSelectedSauceIds([...selectedSauceIds, id]);
    }
  };

  const removeSauce = (index) => {
    setSelectedSauceIds(selectedSauceIds.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => {
          setIsOpen(false);
          setTimeout(onClose, 300);
        }}
        className={`fixed inset-0 bg-black/50 z-[998] transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[999] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Sliders className="w-6 h-6 text-gray-800" />
              <h2 className="text-2xl font-bold text-gray-900">
                Personalizar Lanche
              </h2>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setTimeout(onClose, 300);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Ponto da Carne */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Ponto da Carne
              </h3>
              <div className="flex gap-3">
                {["mal passado", "ao ponto", "bem passado"].map((point) => (
                  <button
                    key={point}
                    onClick={() => setMeatPoint(point)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      meatPoint === point
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {point.charAt(0).toUpperCase() + point.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Adicionais */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Deseja adicional? (máx. 5)
                </h3>
                <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full">
                  {selectedIngredientIds.length}/{maxExtras}
                </span>
              </div>

              <div className="divide-y divide-gray-200">
                {ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex justify-between items-center py-3"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{ing.name}</h4>
                      <p className="text-sm text-gray-500">{ing.desc}</p>
                      <p className="text-sm text-orange-600 font-semibold mt-1">
                        + R$ {ing.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <button
                      onClick={() => addIngredient(ing.id)}
                      disabled={selectedIngredientIds.length >= maxExtras}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border text-orange-500 text-lg font-bold transition-all ${
                        selectedIngredientIds.length >= maxExtras
                          ? "opacity-50 cursor-not-allowed border-gray-300"
                          : "border-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bebidas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Deseja um refrigerante?
              </h3>

              {selectedDrinkIds.length > 0 && (
                <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrinkIds.map((id, idx) => {
                      const drink = drinks.find((d) => d.id === id);
                      return (
                        <div
                          key={idx}
                          className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {drink?.name}
                          <button
                            onClick={() => removeDrink(idx)}
                            className="ml-1 hover:bg-orange-600 rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-200">
                {drinks.map((drink) => (
                  <div
                    key={drink.id}
                    className="flex justify-between items-center py-3"
                  >
                    <h4 className="font-medium text-gray-900">
                      {drink.name}
                      <span className="text-orange-600 font-semibold ml-1">
                        + R$ {drink.price.toFixed(2).replace(".", ",")}
                      </span>
                    </h4>
                    <button
                      onClick={() => addDrink(drink.id)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border text-orange-500 text-lg font-bold transition-all border-orange-500 hover:bg-orange-50`}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pães */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Deseja trocar o pão?
              </h3>
              <p className="text-sm text-gray-500 mb-3">Escolha até 1 opção.</p>
              <div className="divide-y divide-gray-200">
                {breads.map((bread) => (
                  <div
                    key={bread.id}
                    className="flex justify-between items-center py-3"
                  >
                    <h4 className="font-medium text-gray-900">
                      {bread.name}
                      <span className="text-orange-600 font-semibold ml-1">
                        + R$ {bread.price.toFixed(2).replace(".", ",")}
                      </span>
                    </h4>
                    <button
                      onClick={() => selectBread(bread.id)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border text-orange-500 text-lg font-bold transition-all ${
                        selectedBreadId === bread.id
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      {selectedBreadId === bread.id ? "✓" : "+"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Molhos Extras */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Deseja molho extra? (máx. 2)
                </h3>
                <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full">
                  {selectedSauceIds.length}/{maxSauces}
                </span>
              </div>

              {selectedSauceIds.length > 0 && (
                <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSauceIds.map((id, idx) => {
                      const sauce = saucesAvailable.find((s) => s.id === id);
                      return (
                        <div
                          key={idx}
                          className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {sauce?.name}
                          <button
                            onClick={() => removeSauce(idx)}
                            className="ml-1 hover:bg-orange-600 rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-200">
                {saucesAvailable.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center py-3"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{s.name}</h4>
                      <p className="text-sm text-gray-500">{s.desc}</p>
                      <p className="text-sm text-orange-600 font-semibold mt-1">
                        + R$ {s.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <button
                      onClick={() => addSauce(s.id)}
                      disabled={selectedSauceIds.length >= maxSauces}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border text-orange-500 text-lg font-bold transition-all ${
                        selectedSauceIds.length >= maxSauces
                          ? "opacity-50 cursor-not-allowed border-gray-300"
                          : "border-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Observações
              </h3>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: tirar cebola, sem maionese, ponto mais bem passado..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <button
              onClick={() => {
                const customItem = {
                  ...item,
                  qtd: quantity,
                  meatPoint,
                  selectedIngredientIds,
                  selectedDrinkIds,
                  selectedBreadId,
                  selectedSauceIds,
                  observation,
                };
                setIsOpen(false);
                setTimeout(() => onSave(customItem), 300);
              }}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-lg transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
