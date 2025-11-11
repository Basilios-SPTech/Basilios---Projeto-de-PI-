import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  MapPin,
  ShoppingCart,
  Trash2,
  Banknote,
} from "lucide-react";

export default function Checkout() {
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [enderecoSelecionado, setEnderecoSelecionado] = useState("0");

  // Dados mockados
  const enderecos = [
    {
      id: "0",
      nome: "Casa",
      endereco: "Rua das Flores, 123 - Centro, Mauá - SP, 09310-000",
    },
    {
      id: "1",
      nome: "Trabalho",
      endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
    },
    {
      id: "2",
      nome: "Apartamento",
      endereco: "Rua dos Pinheiros, 456 - Pinheiros, São Paulo - SP, 05422-000",
    },
  ];

  const [itens, setItens] = useState([
    { id: 1, nome: "Produto A", preco: 59.9, quantidade: 2, imagem: "📦" },
    { id: 2, nome: "Produto B", preco: 129.9, quantidade: 1, imagem: "📦" },
    { id: 3, nome: "Produto C", preco: 39.9, quantidade: 3, imagem: "📦" },
  ]);

  const calcularSubtotal = () => {
    return itens.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0,
    );
  };

  const calcularFrete = () => 15.0;

  const calcularTotal = () => {
    return calcularSubtotal() + calcularFrete();
  };

  const removerItem = (id) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  const atualizarQuantidade = (id, novaQuantidade) => {
    if (novaQuantidade < 1) return;
    setItens(
      itens.map((item) =>
        item.id === id ? { ...item, quantidade: novaQuantidade } : item,
      ),
    );
  };

  const finalizarCompra = () => {
    alert("Pedido finalizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-12 flex items-center gap-5">
          <ShoppingCart size={32} />
          Finalizar Pedido
        </h1>
        <br />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revisão dos Itens */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
              <div className="space-y-4">
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="text-4xl">{item.imagem}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.nome}</h3>
                      <p className="text-gray-600 text-sm">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          atualizarQuantidade(item.id, item.quantidade - 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() =>
                          atualizarQuantidade(item.id, item.quantidade + 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right min-w-24">
                      <p className="font-semibold">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin size={24} />
                Endereço de Entrega
              </h2>
              <br />
              <div className="space-y-3">
                {enderecos.map((endereco) => (
                  <label
                    key={endereco.id}
                    className={`block p-4 rounded-lg cursor-pointer transition-all ${
                      enderecoSelecionado === endereco.id
                        ? "bg-gray-800 text-white border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="endereco"
                      value={endereco.id}
                      checked={enderecoSelecionado === endereco.id}
                      onChange={(e) => setEnderecoSelecionado(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                          enderecoSelecionado === endereco.id
                            ? "border-white"
                            : "border-gray-400"
                        }`}
                      >
                        {enderecoSelecionado === endereco.id && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{endereco.nome}</p>
                        <p
                          className={`text-sm ${enderecoSelecionado === endereco.id ? "text-gray-300" : "text-gray-600"}`}
                        >
                          {endereco.endereco}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Banknote size={24} />
                Forma de Pagamento
              </h2>
              <br />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setFormaPagamento("pix")}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formaPagamento === "pix"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-50 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <QrCode size={48} className="mx-auto mb-3" />
                  <p className="font-semibold text-lg">PIX</p>
                  <p
                    className={`text-sm mt-1 ${formaPagamento === "pix" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Aprovação imediata
                  </p>
                </button>

                <button
                  onClick={() => setFormaPagamento("cartao")}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formaPagamento === "cartao"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-50 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <CreditCard size={48} className="mx-auto mb-3" />
                  <p className="font-semibold text-lg">Cartão de Crédito</p>
                  <p
                    className={`text-sm mt-1 ${formaPagamento === "cartao" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Parcelamento disponível
                  </p>
                </button>
              </div>

              {formaPagamento === "cartao" && (
                <div className="mt-6 bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-2">
                        Pagamento na Entrega
                      </p>
                      <p className="text-gray-600 text-sm">
                        O pagamento com cartão será processado no momento da
                        entrega. Tenha seu cartão em mãos para finalizar a
                        transação.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="gray-50 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>R$ {calcularSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Frete</span>
                  <span>R$ {calcularFrete().toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-700 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-red-500">
                      R$ {calcularTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={finalizarCompra}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Finalizar Pedido
              </button>

              <div className="mt-4 text-center text-sm text-gray-400">
                <p>🔒 Pagamento seguro</p>
                <p className="mt-1">Seus dados estão protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
