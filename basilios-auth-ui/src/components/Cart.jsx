import CartItem from "./CartItem";
import React, { useState, useEffect } from "react";
import { ShoppingCart, X } from "lucide-react";
import CustomizeBurger from "./CustomizeBurger";
import { useNavigate } from "react-router-dom";

const CHAVE_CART = "carrinho-basilios";

export default function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  // carregar o carrinho do localStorage
  useEffect(() => {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
    setCartItems(Array.isArray(salvo) ? salvo : []);
  }, []);

  // escutar quando o Home.jsx atualizar o carrinho
  useEffect(() => {
    const atualizar = () => {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
      setCartItems(Array.isArray(salvo) ? salvo : []);
    };
    window.addEventListener("cartUpdated", atualizar);
    return () => window.removeEventListener("cartUpdated", atualizar);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (!body) return;

    if (isOpen) {
      body.classList.add("cart-open");
    } else {
      body.classList.remove("cart-open");
    }

    // limpeza: se o componente desmontar, garante que a classe sai
    return () => body.classList.remove("cart-open");
  }, [isOpen]);


  const totalItems = cartItems.reduce((sum, item) => sum + item.qtd, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.preco * item.qtd,
    0,
  );

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const atualizados = cartItems.map((item) =>
      item.id === itemId ? { ...item, qtd: newQuantity } : item,
    );
    setCartItems(atualizados);
    localStorage.setItem(CHAVE_CART, JSON.stringify(atualizados));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemoveItem = (itemId) => {
    const atualizados = cartItems.filter((item) => item.id !== itemId);
    setCartItems(atualizados);
    localStorage.setItem(CHAVE_CART, JSON.stringify(atualizados));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleClearCart = () => {
    localStorage.removeItem(CHAVE_CART);
    setCartItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  function goToCheckout() {
    navigate("/checkout");
  }

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-[100]"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-[998] transition-opacity"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[999] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <h2 className="text-2xl font-bold text-gray-900">Carrinho</h2>
              <span className="bg-gray-200 text-gray-700 text-sm font-semibold px-2 py-1 rounded-full">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Itens */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
                <p className="text-gray-400 text-sm mt-2">
                  Adicione produtos para começar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={{
                      id: item.id,
                      name: item.nome,
                      description: item.descricao,
                      price: item.preco,
                      quantity: item.qtd,
                      image: item.imagem,
                    }}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    onEdit={(item) => {
                      setSelectedItem(item);
                      setIsCustomizeOpen(true);
                    }}
                  />
                ))}

                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="w-full mt-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Limpar Carrinho
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={goToCheckout}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                Finalizar Compra
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tela de Personalização (abre ao clicar no lápis) */}
      {isCustomizeOpen && (
        <CustomizeBurger
          item={selectedItem}
          onClose={() => setIsCustomizeOpen(false)}
          onSave={(customizedItem) => {
            const atualizado = cartItems.map((p) =>
              p.id === customizedItem.id ? { ...p, ...customizedItem } : p,
            );
            setCartItems(atualizado);
            localStorage.setItem(CHAVE_CART, JSON.stringify(atualizado));
            window.dispatchEvent(new Event("cartUpdated"));
            setIsCustomizeOpen(false);
          }}
        />
      )}
    </>
  );
}
