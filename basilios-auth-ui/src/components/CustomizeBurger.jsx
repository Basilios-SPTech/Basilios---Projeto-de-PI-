import React, { useState, useEffect, useMemo } from "react";
import { X, Sliders, Minus, Plus } from "lucide-react";
import { http } from "../services/http.js";

export default function CustomizeBurger({ item, onClose, onSave }) {
  const [isOpen, setIsOpen] = useState(true);
  const [meatPoint, setMeatPoint] = useState("médio");

  // Determina se o produto é um hamburguer/lanche
  // Se for bebida, acompanhamento ou sobremesa, retorna false
  const isBurger = useMemo(() => {
    if (!item) return false;
    const categoria = (item.categoria || item.category || "").toLowerCase();
    const nome = (item.nome || item.name || "").toLowerCase();
    
    // Categorias que NÃO são hambugueres
    const nonBurgerCategories = ["bebida", "acompanhamento", "sobremesa", "drink", "drinks"];
    
    // Se a categoria está na lista de não-hambugueres, não é hamburguer
    for (const cat of nonBurgerCategories) {
      if (categoria.includes(cat) || nome.includes(cat)) {
        return false;
      }
    }
    
    // Se for Lanches Premium, Beirutes, Hot-Dog, Combos, etc. = é hamburguer
    const burgerKeywords = ["lanche", "premium", "beirute", "hot-dog", "combo", "x-", "burger", "hamburguer"];
    for (const keyword of burgerKeywords) {
      if (categoria.includes(keyword) || nome.includes(keyword)) {
        return true;
      }
    }
    
    // Por padrão, se tem a opção de ponto da carne, é hamburguer
    return true;
  }, [item]);

  const [availableAdditions, setAvailableAdditions] = useState([]);
  const [additionsLoading, setAdditionsLoading] = useState(false);
  const [additionsError, setAdditionsError] = useState("");

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

  const maxExtras = 5;
  const maxSauces = 2;

  // Objetos para armazenar quantidades de cada item
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const [drinkQuantities, setDrinkQuantities] = useState({});
  const [selectedBreadId, setSelectedBreadId] = useState(null);
  const [sauceQuantities, setSauceQuantities] = useState({});

  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");

  const productId = useMemo(() => {
    if (!item) return null;
    return (
      item.originalProductId ??
      item.productId ??
      item.id ??
      item.index ??
      null
    );
  }, [item]);

  useEffect(() => {
    let alive = true;

    async function fetchAdditions() {
      if (!productId) {
        if (alive) setAvailableAdditions([]);
        return;
      }

      setAdditionsLoading(true);
      setAdditionsError("");

      try {
        const { data } = await http.get(`/products/${productId}/adicionais`);
        const list = Array.isArray(data) ? data : data?.content || [];
        if (alive) setAvailableAdditions(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!alive) return;
        setAvailableAdditions([]);
        setAdditionsError(err?.message || "Erro ao carregar adicionais.");
      } finally {
        if (alive) setAdditionsLoading(false);
      }
    }

    fetchAdditions();

    return () => {
      alive = false;
    };
  }, [productId]);

  const extraAdditions = useMemo(() => {
    return availableAdditions.filter(
      (addition) =>
        String(addition?.subcategory || "").toUpperCase() !== "MOLHO",
    );
  }, [availableAdditions]);

  const sauceAdditions = useMemo(() => {
    return availableAdditions.filter(
      (addition) =>
        String(addition?.subcategory || "").toUpperCase() === "MOLHO",
    );
  }, [availableAdditions]);

  useEffect(() => {
    if (!item) return;

    setQuantity(item.qtd || item.quantity || 1);
    setMeatPoint(item.meatPoint || "médio");
    setDrinkQuantities(item.drinkQuantities || {});
    setSelectedBreadId(item.selectedBreadId || null);
    setObservation(item.observation || "");

    const additions = Array.isArray(item.additions) ? item.additions : [];

    if (additions.length > 0) {
      const extras = {};
      const sauces = {};

      additions.forEach((addition) => {
        const id = Number(addition?.adicionalId ?? addition?.id);
        if (!Number.isFinite(id)) return;

        const qty = Number(addition?.quantity ?? 1);
        if (!Number.isFinite(qty) || qty <= 0) return;

        const subcategory = String(addition?.subcategory || "").toUpperCase();
        const target = subcategory === "MOLHO" ? sauces : extras;
        target[id] = (target[id] || 0) + qty;
      });

      setIngredientQuantities(extras);
      setSauceQuantities(sauces);
      return;
    }

    setIngredientQuantities(item.ingredientQuantities || {});
    setSauceQuantities(item.sauceQuantities || {});
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

  // Funções para adicionar/remover ingredientes com contador
  const addIngredient = (id) => {
    setIngredientQuantities((prev) => {
      const current = prev[id] || 0;
      if (current < maxExtras) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const removeIngredient = (id) => {
    setIngredientQuantities((prev) => {
      const current = prev[id] || 0;
      if (current > 1) {
        return { ...prev, [id]: current - 1 };
      }
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const addDrink = (id) => {
    setDrinkQuantities((prev) => {
      return { ...prev, [id]: (prev[id] || 0) + 1 };
    });
  };

  const removeDrink = (id) => {
    setDrinkQuantities((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const selectBread = (id) => {
    setSelectedBreadId(selectedBreadId === id ? null : id);
  };

  const addSauce = (id) => {
    setSauceQuantities((prev) => {
      const current = prev[id] || 0;
      if (current < maxSauces) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const removeSauce = (id) => {
    setSauceQuantities((prev) => {
      const current = prev[id] || 0;
      if (current > 1) {
        return { ...prev, [id]: current - 1 };
      }
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  // Calcula o preço final atualizado em tempo real
  const finalPrice = useMemo(() => {
    const extraIngredientsPrice = Object.entries(ingredientQuantities)
      .reduce((acc, [id, qty]) => {
        const addition = extraAdditions.find((i) => i.id === parseInt(id));
        return acc + ((addition?.price || 0) * qty);
      }, 0);

    const extraSaucesPrice = Object.entries(sauceQuantities)
      .reduce((acc, [id, qty]) => {
        const sauce = sauceAdditions.find((s) => s.id === parseInt(id));
        return acc + ((sauce?.price || 0) * qty);
      }, 0);

    const extraDrinksPrice = Object.entries(drinkQuantities)
      .reduce((acc, [id, qty]) => {
        const drink = drinks.find((d) => d.id === parseInt(id));
        return acc + ((drink?.price || 0) * qty);
      }, 0);

    const breadPrice =
      selectedBreadId != null
        ? breads.find((b) => b.id === selectedBreadId)?.price || 0
        : 0;

    // Usa precoBase se existir (foi editado antes), senão usa preco/price
    const basePrice = item.precoBase ?? item.preco ?? item.price ?? 0;

    return basePrice + extraIngredientsPrice + extraSaucesPrice + extraDrinksPrice + breadPrice;
  }, [ingredientQuantities, sauceQuantities, drinkQuantities, selectedBreadId, item, extraAdditions, sauceAdditions]);

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
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Deseja adicional? (máx. 5 por item)
              </h3>

              {additionsLoading && (
                <p className="text-sm text-gray-500">Carregando adicionais...</p>
              )}

              {!additionsLoading && additionsError && (
                <p className="text-sm text-red-600">{additionsError}</p>
              )}

              {!additionsLoading && !additionsError && extraAdditions.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum adicional disponível.</p>
              )}

              {!additionsLoading && !additionsError && extraAdditions.length > 0 && (
                <div className="divide-y divide-gray-200">
                  {extraAdditions.map((addition) => (
                    <div
                      key={addition.id}
                      className="flex justify-between items-center py-3"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {addition.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {addition.subcategory}
                        </p>
                        <p className="text-sm text-orange-600 font-semibold mt-1">
                          + R$ {Number(addition.price || 0).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      {ingredientQuantities[addition.id] ? (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-500 rounded-lg px-2 py-1">
                          <button
                            onClick={() => removeIngredient(addition.id)}
                            className="w-6 h-6 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-semibold text-gray-900">
                            {ingredientQuantities[addition.id]}
                          </span>
                          <button
                            onClick={() => addIngredient(addition.id)}
                            disabled={ingredientQuantities[addition.id] >= maxExtras}
                            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                              ingredientQuantities[addition.id] >= maxExtras
                                ? "opacity-50 cursor-not-allowed text-gray-400"
                                : "text-orange-500 hover:bg-orange-100"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addIngredient(addition.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-500 text-orange-500 text-lg font-bold transition-all hover:bg-orange-50"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bebidas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Deseja um refrigerante?
              </h3>

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
                    {drinkQuantities[drink.id] ? (
                      <div className="flex items-center gap-2 bg-orange-50 border border-orange-500 rounded-lg px-2 py-1">
                        <button
                          onClick={() => removeDrink(drink.id)}
                          className="w-6 h-6 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold text-gray-900">
                          {drinkQuantities[drink.id]}
                        </span>
                        <button
                          onClick={() => addDrink(drink.id)}
                          className="w-6 h-6 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addDrink(drink.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-500 text-orange-500 text-lg font-bold transition-all hover:bg-orange-50"
                      >
                        +
                      </button>
                    )}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Deseja molho extra? (máx. 2 por item)
              </h3>

              {!additionsLoading && !additionsError && sauceAdditions.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum molho disponível.</p>
              )}

              {!additionsLoading && !additionsError && sauceAdditions.length > 0 && (
                <div className="divide-y divide-gray-200">
                  {sauceAdditions.map((sauce) => (
                    <div
                      key={sauce.id}
                      className="flex justify-between items-center py-3"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{sauce.name}</h4>
                        <p className="text-sm text-gray-500">{sauce.subcategory}</p>
                        <p className="text-sm text-orange-600 font-semibold mt-1">
                          + R$ {Number(sauce.price || 0).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      {sauceQuantities[sauce.id] ? (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-500 rounded-lg px-2 py-1">
                          <button
                            onClick={() => removeSauce(sauce.id)}
                            className="w-6 h-6 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-semibold text-gray-900">
                            {sauceQuantities[sauce.id]}
                          </span>
                          <button
                            onClick={() => addSauce(sauce.id)}
                            disabled={sauceQuantities[sauce.id] >= maxSauces}
                            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                              sauceQuantities[sauce.id] >= maxSauces
                                ? "opacity-50 cursor-not-allowed text-gray-400"
                                : "text-orange-500 hover:bg-orange-100"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addSauce(sauce.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-500 text-orange-500 text-lg font-bold transition-all hover:bg-orange-50"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
            {/* Exibição do preço total */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Preço Total:</span>
                <span className="text-2xl font-bold text-red-600">
                  R$ {finalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const additionLookup = new Map(
                  availableAdditions.map((addition) => [
                    Number(addition.id),
                    addition,
                  ]),
                );

                // Converter quantidades para arrays de nomes (para exibição)
                const selectedIngredientNames = Object.entries(ingredientQuantities)
                  .flatMap(([id, qty]) => {
                    const addition = additionLookup.get(Number(id));
                    return Array(qty).fill(addition?.name || "");
                  });

                const selectedSauceNames = Object.entries(sauceQuantities)
                  .flatMap(([id, qty]) => {
                    const sauce = additionLookup.get(Number(id));
                    return Array(qty).fill(sauce?.name || "");
                  });

                // Criar objeto com preços dos ingredientes para referência futura
                const ingredientPrices = {};
                Object.keys(ingredientQuantities).forEach((id) => {
                  const addition = additionLookup.get(Number(id));
                  if (addition) {
                    ingredientPrices[id] = addition.price;
                  }
                });

                const drinkPrices = {};
                Object.keys(drinkQuantities).forEach((id) => {
                  const drink = drinks.find((d) => d.id === parseInt(id));
                  if (drink) {
                    drinkPrices[id] = drink.price;
                  }
                });

                const saucePrices = {};
                Object.keys(sauceQuantities).forEach((id) => {
                  const sauce = additionLookup.get(Number(id));
                  if (sauce) {
                    saucePrices[id] = sauce.price;
                  }
                });

                const basePrice = item.precoBase ?? item.preco ?? item.price ?? 0;
                const breadPrice =
                  selectedBreadId != null
                    ? breads.find((b) => b.id === selectedBreadId)?.price || 0
                    : 0;

                const buildAdditions = (quantities) =>
                  Object.entries(quantities)
                    .map(([id, qty]) => {
                      const addition = additionLookup.get(Number(id));
                      const additionId = Number(addition?.id ?? id);
                      if (!Number.isFinite(additionId)) return null;

                      return {
                        adicionalId: additionId,
                        name: addition?.name || `Adicional ${id}`,
                        price: Number(addition?.price || 0),
                        subcategory: addition?.subcategory || "OUTRO",
                        quantity: Number(qty) || 0,
                      };
                    })
                    .filter((entry) => entry && entry.quantity > 0);

                const additions = [
                  ...buildAdditions(ingredientQuantities),
                  ...buildAdditions(sauceQuantities),
                ];

                const customItem = {
                  ...item,
                  precoBase: basePrice,
                  preco: finalPrice,
                  price: finalPrice,
                  qtd: quantity,
                  meatPoint,
                  ingredientQuantities,
                  ingredientPrices,
                  selectedIngredientNames,
                  drinkQuantities,
                  drinkPrices,
                  selectedBreadId,
                  breadPrice,
                  sauceQuantities,
                  saucePrices,
                  selectedSauceNames,
                  additions,
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
