import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CreditCard,
  QrCode,
  MapPin,
  ShoppingCart,
  Trash2,
  Banknote,
} from "lucide-react";

import axios from "axios";
import AddAddress from "./AddAddress";

const CHAVE_CART = "carrinho-basilios";

export default function Checkout() {
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [enderecoSelecionado, setEnderecoSelecionado] = useState("1");
  const [endUser, setEndUser] = useState([]);
  const [itens, setItens] = useState([]);
  const navigate = useNavigate();

  const calcularSubtotal = () => {
    return itens.reduce((total, item) => total + item.preco * item.qtd, 0);
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
        item.id === id ? { ...item, qtd: novaQuantidade } : item,
      ),
    );
  };

  const endOrder = async () => {
    let itensPedido = itens.map((i) => ({
      productId: i.originalProductId,
      quantity: i.qtd,
      observations: i.observation,
    }));

    console.log(`Itens pedido: ${itensPedido}`);

    let body = {
      addressId: Number(enderecoSelecionado),
      items: itensPedido,
      deliveryFee: 0,
      discount: 0,
      observations: "",
    };

    let req = await axios.post("http://localhost:8080/orders", body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    let lastOrderId = req.data.id;
    console.log(lastOrderId);

    if (formaPagamento == "pix") {
      let abacatePayReq = await axios.post(
        "/api/abacate/v1/pixQrCode/create",
        {
          amount: calcularTotal().toFixed(2),
          expiresIn: 600,
          description: `Pedido Id: ${lastOrderId}`,
          customer: {
            name: "Pedro Morais",
            cellphone: "(11) 4002-8922",
            email: "daniel_lima@abacatepay.com",
            taxId: "522.361.808.45",
          },
          metadata: {
            externalId: lastOrderId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_ABACATE_TOKEN}`,
          },
        },
      );

      localStorage.setItem("qrCode", abacatePayReq.data.data.brCodeBase64);
      localStorage.setItem("brCode", abacatePayReq.data.data.brCode);
      localStorage.setItem("pixId", abacatePayReq.data.data.id);

      console.log(abacatePayReq);
      console.log(abacatePayReq.data.data.brCodeBase64);
      console.log(abacatePayReq.data.data.brCode);

      setTimeout(() => {
        navigate("/pix-checkout");
      }, 2000);
    } else {
      toast.success(
        "Você selecionou 'Cartão de Crédito' como forma de pagamento! Você será redirecionado para a tela de acompanhamento do pedido e deverá realizar o pagamento na entrega",
        {
          duration: 6000,
        },
      );

      setTimeout(() => {
        navigate("/order-status");
      }, 6500);
    }

    // tem que remover isso em outro lugar
    // localStorage.removeItem(CHAVE_CART);
  };

  useEffect(() => {
    try {
      async function getEnderecos() {
        try {
          const response = await axios.get("http://localhost:8080/address", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          });

          setEndUser(response.data);
        } catch (err) {
          console.log(err);
        }
      }

      getEnderecos();
      setItens(JSON.parse(localStorage.getItem(CHAVE_CART)));
    } catch (err) {
      console.log(err);
    }
  }, []);

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
                    <img
                      src={item.imagem}
                      alt={item.nome}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.nome}</h3>
                      <p className="text-gray-600 text-sm">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          atualizarQuantidade(item.id, item.qtd - 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.qtd}</span>
                      <button
                        onClick={() =>
                          atualizarQuantidade(item.id, item.qtd + 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right min-w-24">
                      <p className="font-semibold">
                        R$ {(item.preco * item.qtd).toFixed(2)}
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
                {endUser.map((endereco) => (
                  <label
                    key={endereco.id}
                    className={`block p-4 rounded-lg cursor-pointer transition-all ${
                      Number(enderecoSelecionado) === endereco.id
                        ? "bg-gray-800 text-white border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="endereco"
                      value={endereco.id}
                      checked={Number(enderecoSelecionado) === endereco.id}
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
                        <p className="font-semibold">
                          {endereco.enderecoCompleto}
                        </p>
                        <p
                          className={`text-sm ${enderecoSelecionado == endereco.id ? "text-gray-300" : "text-gray-600"}`}
                        ></p>
                      </div>
                    </div>
                  </label>
                ))}

                <AddAddress />
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
                  className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                    formaPagamento === "pix"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-50 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <QrCode size={48} className="mx-auto mb-3" />
                  <p className="font-semibold text-lg">PIX</p>
                  <p
                    className={`text-sm mt-1 ${formaPagamento === "pix" ? "text-gray-300" : "text-gray-600"}`}
                  ></p>
                </button>

                <button
                  onClick={() => setFormaPagamento("cartao")}
                  className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                    formaPagamento === "cartao"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-50 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <CreditCard size={48} className="mx-auto mb-3" />
                  <p className="font-semibold text-lg">Cartão de Crédito</p>
                  <p
                    className={`text-sm mt-1 ${formaPagamento === "cartao" ? "text-gray-300" : "text-gray-600"}`}
                  ></p>
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
                onClick={endOrder}
                className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
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
