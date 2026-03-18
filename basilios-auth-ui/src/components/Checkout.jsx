import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Hamburger,
  CreditCard,
  QrCode,
  MapPin,
  ShoppingCart,
  Trash2,
  Banknote,
} from "lucide-react";

import axios from "axios";
import AddAddress from "./AddAddress";
import ProgressBar from "./loading/ProgressBar";

const CHAVE_CART = "carrinho-basilios";

export default function Checkout() {
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [enderecoSelecionado, setEnderecoSelecionado] = useState("1");
  const [endUser, setEndUser] = useState([]);
  const [itens, setItens] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const calcularSubtotal = () => {
    return itens.reduce((total, item) => total + item.preco * item.qtd, 0);
  };

  const calcularFrete = () => 5.0;

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

  const sanitizeImageUrl = (url) => {
    if (!url) return "/placeholder.jpg";

    // Bloqueia javascript: e data: URIs maliciosos
    if (url.startsWith("javascript:") || url.startsWith("data:text/html")) {
      return "/placeholder.jpg";
    }

    // Aceita apenas HTTP(S) ou caminhos relativos
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    ) {
      return url;
    }

    return "/placeholder.jpg";
  };

  const endOrder = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
    let itensPedido = itens.map((i) => ({
      productId: i.originalProductId,
      quantity: i.qtd,
      observations: i.observation,
    }));

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
    localStorage.setItem("lastOrderId", lastOrderId);

    if (formaPagamento == "pix") {
      let abacatePayReq = await axios.post(
        "/api/abacate/v1/pixQrCode/create",
        {
          amount: 3100,
          expiresIn: 600,
          description: "Pedido teste",
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
            Authorization: `Bearer abc_dev_J24NemeHukwqGwfe2bj63G2q`,
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
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err);
      toast.error("Erro ao finalizar pedido. Tente novamente.");
      setSubmitting(false);
    }
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

          const enderecos = Array.isArray(response.data) ? response.data : [];
          setEndUser(enderecos);

          const preferredAddressId = Number(
            localStorage.getItem("checkout-address-id"),
          );

          if (
            Number.isFinite(preferredAddressId) &&
            enderecos.some((endereco) => endereco.id === preferredAddressId)
          ) {
            setEnderecoSelecionado(preferredAddressId);
          } else if (enderecos.length > 0) {
            setEnderecoSelecionado(enderecos[0].id);
          }

          localStorage.removeItem("checkout-address-id");
        } catch (err) {
          console.log(err);
        }
      }

      getEnderecos();
      const cart = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
      setItens(Array.isArray(cart) ? cart : []);
    } catch (err) {
      console.log(err);
      setItens([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 px-4 py-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Voltar ao cardápio */}
        <button
          onClick={() => navigate("/home")}
          className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <Hamburger size={16} />
          Ainda não acabou a fome? Continue comprando
        </button>

        <h1 className="text-2xl md:text-3xl font-bold pb-6 mb-8 border-b border-gray-300 flex items-center gap-3 md:gap-5">
          <ShoppingCart size={28} className="shrink-0" />
          Finalizar Pedido
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revisão dos Itens */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Itens do Pedido</h2>
              <div className="space-y-4">
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200"
                  >
                    <img
                      src={sanitizeImageUrl(item.imagem)}
                      alt={item.nome}
                      className="w-14 h-14 md:w-16 md:h-16 object-cover rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{item.nome}</h3>
                      <p className="text-gray-600 text-xs md:text-sm">
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
                      <span className="w-8 md:w-12 text-center text-sm">{item.qtd}</span>
                      <button
                        onClick={() =>
                          atualizarQuantidade(item.id, item.qtd + 1)
                        }
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right min-w-[70px] md:min-w-24">
                      <p className="font-semibold text-sm md:text-base">
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
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
              <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin size={22} className="shrink-0" />
                Endereço de Entrega
              </h2>
              <div className="space-y-3">
                {endUser.map((endereco) => (
  <label
    key={endereco.id}
    className={`block p-3 md:p-4 rounded-lg cursor-pointer transition-all ${
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
      onChange={(e) => setEnderecoSelecionado(Number(e.target.value))}
      className="hidden"
    />

    <div className="flex items-start gap-3">
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
          Number(enderecoSelecionado) === endereco.id
            ? "border-white"
            : "border-gray-400"
        }`}
      >
        {Number(enderecoSelecionado) === endereco.id && (
          <div className="w-3 h-3 bg-white rounded-full"></div>
        )}
      </div>

      <div>
        <p className="font-semibold text-sm md:text-base">
          {endereco.enderecoCompleto}
        </p>

        <p
          className={`text-sm ${
            Number(enderecoSelecionado) === endereco.id
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        ></p>
      </div>
    </div>
  </label>
))}

                <AddAddress />
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
              <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                <Banknote size={22} className="shrink-0" />
                Forma de Pagamento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setFormaPagamento("pix")}
                  className={`p-4 md:p-6 rounded-lg border-2 transition-all cursor-pointer ${
                    formaPagamento === "pix"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-50 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <QrCode size={36} className="mx-auto mb-2 md:mb-3 md:w-12! md:h-12!" />
                  <p className="font-semibold text-base md:text-lg">PIX</p>
                  <p
                    className={`text-sm mt-1 ${formaPagamento === "pix" ? "text-gray-300" : "text-gray-600"}`}
                  ></p>
                </button>

                <button
                  onClick={() => setFormaPagamento("cartao")}
                  className={`p-4 md:p-6 rounded-lg border-2 transition-all cursor-pointer ${
                    formaPagamento === "cartao"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-50 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <CreditCard size={36} className="mx-auto mb-2 md:mb-3 md:w-12! md:h-12!" />
                  <p className="font-semibold text-base md:text-lg">Cartão de Crédito</p>
                  <p
                    className={`text-sm mt-1 ${formaPagamento === "cartao" ? "text-gray-300" : "text-gray-600"}`}
                  ></p>
                </button>
              </div>

              {formaPagamento === "cartao" && (
                <div className="mt-4 md:mt-6 bg-gray-50 p-4 md:p-6 rounded-lg border-2 border-gray-300">
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
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md lg:sticky lg:top-8">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Resumo do Pedido</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm md:text-base text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {calcularSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base text-gray-600">
                  <span>Frete</span>
                  <span>R$ {calcularFrete().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg md:text-xl font-bold">
                    <span>Total</span>
                    <span className="text-red-500">
                      R$ {calcularTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={endOrder}
                className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-colors"
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

      <ProgressBar visible={submitting} message="Processando seu pedido..." />
    </div>
  );
}
