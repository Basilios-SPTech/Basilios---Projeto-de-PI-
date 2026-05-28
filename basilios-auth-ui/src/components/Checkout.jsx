import { useState, useEffect, useCallback } from "react";
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
  Edit,
} from "lucide-react";

import AddAddress from "./AddAddress";
import ProgressBar from "./loading/ProgressBar";
import CustomizeBurger from "./CustomizeBurger";
import StoreStatusBanner from "./StoreStatusBanner.jsx";
import { http } from "../services/http.js";
import { useBusinessHours } from "../hooks/useBusinessHours.js";
import { getStoreProfile } from "../services/storeApi.js";
import {
  listMyAddresses,
  deleteAddress as deleteAddressApi,
} from "../services/addressApi.js";

const CHAVE_CART = "carrinho-basilios";
const PENDING_PIX_ORDER_KEY = "pending-pix-order";

export default function Checkout() {
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [enderecoSelecionado, setEnderecoSelecionado] = useState("");
  const [endUser, setEndUser] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [itens, setItens] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deliveryObservations, setDeliveryObservations] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState(true);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [loadingActiveOrder, setLoadingActiveOrder] = useState(true);
  const navigate = useNavigate();
  const { status: businessStatus, checkStoreStatus } = useBusinessHours();

  const loadDeliveryFee = useCallback(async () => {
    setLoadingDeliveryFee(true);
    try {
      const store = await getStoreProfile();
      const parsedFee = Number(store?.deliveryFee);
      const nextFee = Number.isFinite(parsedFee) && parsedFee >= 0 ? parsedFee : 0;
      setDeliveryFee(nextFee);
      return nextFee;
    } catch (err) {
      console.error("Erro ao carregar taxa de entrega da loja:", err);
      setDeliveryFee(0);
      return 0;
    } finally {
      setLoadingDeliveryFee(false);
    }
  }, []);

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    setAddressError("");

    try {
      const enderecos = await listMyAddresses();
      setEndUser(enderecos);

      const preferredAddressId = Number(
        localStorage.getItem("checkout-address-id"),
      );

      setEnderecoSelecionado((current) => {
        if (
          Number.isFinite(preferredAddressId) &&
          enderecos.some((endereco) => Number(endereco.id) === preferredAddressId)
        ) {
          return String(preferredAddressId);
        }

        if (
          current &&
          enderecos.some((endereco) => String(endereco.id) === String(current))
        ) {
          return current;
        }

        return "";
      });

      localStorage.removeItem("checkout-address-id");
    } catch (err) {
      console.error("Erro ao carregar endereços:", err);

      if (err?.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/login");
        return;
      }

      setEndUser([]);
      setEnderecoSelecionado("");
      setAddressError(err?.message || "Erro ao carregar endereços.");
    } finally {
      setLoadingAddresses(false);
    }
  }, [navigate]);

  const checkActiveOrders = useCallback(async () => {
    setLoadingActiveOrder(true);
    try {
      const response = await http.get("/orders/me?page=0&size=1");
      const orders = response.data?.content || [];
      
      // Verificar se há algum pedido ativo (não ENTREGUE e não CANCELADO)
      const active = orders.some(order => 
        order.status !== "ENTREGUE" && order.status !== "CANCELADO"
      );
      
      setHasActiveOrder(active);
    } catch (err) {
      console.error("Erro ao verificar pedidos ativos:", err);
      setHasActiveOrder(false);
    } finally {
      setLoadingActiveOrder(false);
    }
  }, []);

  const getAddressLabel = (endereco) => {
    if (endereco?.enderecoCompleto) return endereco.enderecoCompleto;
    const rua = endereco?.rua || "";
    const numero = endereco?.numero || "S/N";
    const bairro = endereco?.bairro || "";
    const cidade = endereco?.cidade || "";
    const estado = endereco?.estado || "";
    return `${rua}, ${numero} - ${bairro} - ${cidade}/${estado}`.replace(/\s+-\s+-/g, " -");
  };

  const calcularSubtotal = () => {
    return itens.reduce((total, item) => total + item.preco * item.qtd, 0);
  };

  const calcularFrete = () => {
    const fee = Number(deliveryFee);
    return Number.isFinite(fee) && fee >= 0 ? fee : 0;
  };

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

  const editarItem = (item) => {
    setSelectedItem(item);
    setIsCustomizeOpen(true);
  };

  const openDeleteAddressModal = (endereco, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setAddressToDelete(endereco);
  };

  const closeDeleteAddressModal = () => {
    if (deletingAddress) return;
    setAddressToDelete(null);
  };

  const confirmDeleteAddress = async () => {
    const id = Number(addressToDelete?.id);
    if (!id) {
      toast.error("Endereço inválido para exclusão.");
      setAddressToDelete(null);
      return;
    }

    setDeletingAddress(true);
    try {
      const wasSelected = Number(enderecoSelecionado) === id;

      await deleteAddressApi(id);

      if (wasSelected) {
        setEnderecoSelecionado("");
      }

      await loadAddresses();

      setAddressToDelete(null);
      toast.success("Endereço excluído com sucesso.");
    } catch (err) {
      console.error("Erro ao excluir endereço:", err);
      toast.error(err?.message || "Não foi possível excluir o endereço.");
    } finally {
      setDeletingAddress(false);
    }
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
    if (!enderecoSelecionado) {
      toast.error("Selecione um endereço antes de finalizar o pedido.");
      return;
    }

    if (hasActiveOrder) {
      toast.error("Você possui um pedido ativo que precisa ser concluído ou cancelado antes de fazer um novo pedido.");
      return;
    }

    const latestStoreStatus = await checkStoreStatus({ force: true, showLoading: false });

    if (latestStoreStatus && !latestStoreStatus.open) {
      toast.error("A loja está fechada no momento. " + (latestStoreStatus.message || ""));
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
    const currentDeliveryFee = await loadDeliveryFee();

    const itensPedido = itens.map((item) => {
      const additions = Array.isArray(item.additions) ? item.additions : [];
      const adicionais = additions
        .map((addition) => {
          const adicionalId = Number(addition?.adicionalId ?? addition?.id);
          const quantity = Number(addition?.quantity ?? 0);
          if (!Number.isFinite(adicionalId) || !Number.isFinite(quantity) || quantity <= 0) {
            return null;
          }
          return { adicionalId, quantity };
        })
        .filter(Boolean);

      const observationParts = [];
      if (item.observation) observationParts.push(String(item.observation).trim());
      if (item.meatPoint) {
        observationParts.push(`PONTO DA CARNE: ${item.meatPoint}`);
      }

      return {
        productId: item.originalProductId ?? item.productId ?? item.id,
        quantity: item.qtd ?? item.quantity ?? 1,
        observations: observationParts.filter(Boolean).join(" | "),
        adicionais,
      };
    });

    let body = {
      addressId: Number(enderecoSelecionado),
      items: itensPedido,
      deliveryFee: currentDeliveryFee,
      discount: 0,
      observations: String(deliveryObservations || "").trim(),
    };

    if (formaPagamento == "pix") {
      // 1. Criar o pedido PRIMEIRO no backend
      let req = await http.post("/orders", body);
      let orderId = req.data.id;

      // 2. Chamar AbacatePay com o orderId nos metadados
      const abacatePayResp = await fetch("/api/abacate/v1/pixQrCode/create", {
        method: "POST",
        headers: {
          Authorization: "Bearer abc_dev_Xkmtb0HuqJrPW42uaNFDPSPd",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 3100,
          expiresIn: 600,
          description: `Pedido #${orderId}`,
          customer: {
            name: "Pedro Morais",
            cellphone: "(11) 4002-8922",
            email: "daniel_lima@abacatepay.com",
            taxId: "522.361.808.45",
          },
          metadata: {
            orderId: String(orderId),
            externalId: `pix-${orderId}-${Date.now()}`,
          },
        }),
      });

      if (!abacatePayResp.ok) {
        throw new Error("Falha ao gerar QR Code PIX");
      }

      const abacatePayData = await abacatePayResp.json();

      // 3. Salvar a associação entre orderId e pixId do AbacatePay
      localStorage.setItem("lastOrderId", String(orderId));
      localStorage.setItem("pixId", abacatePayData.data.id); // ID do AbacatePay
      localStorage.setItem("brCodeBase64", abacatePayData.data.brCodeBase64); // QR Code em base64
      localStorage.setItem("brCode", abacatePayData.data.brCode); // Código PIX para copiar e colar
      localStorage.setItem("pixOrderId", String(orderId)); // ID do nosso pedido

      console.log("Pedido criado:", orderId);
      console.log("PIX AbacatePay criado:", abacatePayData.data.id);

      setTimeout(() => {
        navigate("/pix-checkout");
      }, 2000);
    } else {
      let req = await http.post("/orders", body);

      let lastOrderId = req.data.id;
      localStorage.setItem("lastOrderId", String(lastOrderId));

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
      if (formaPagamento == "pix") {
        localStorage.removeItem(PENDING_PIX_ORDER_KEY);
      }
      if (err?.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/login");
        return;
      }
      toast.error("Erro ao finalizar pedido. Tente novamente.");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    try {
      loadAddresses();
      loadDeliveryFee();
      checkActiveOrders();
      const cart = JSON.parse(localStorage.getItem(CHAVE_CART) || "[]");
      setItens(Array.isArray(cart) ? cart : []);
    } catch (err) {
      console.log(err);
      setItens([]);
    }
  }, [loadAddresses, loadDeliveryFee, checkActiveOrders]);

  const handleAddressCreated = async (createdAddress) => {
    await loadAddresses();
    if (createdAddress?.id != null) {
      setEnderecoSelecionado(String(createdAddress.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 px-4 py-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Status da Loja */}
        <StoreStatusBanner />

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
              <div className="pb-6 md:pb-8">
                <h2 className="text-lg md:text-xl font-semibold">Itens do Pedido</h2>
              </div>
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
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => editarItem(item)}
                        className="text-gray-500 hover:text-blue-600"
                        title="Editar item"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => removerItem(item.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Remover item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Adicionais */}
                    {(() => {
                      const additions = Array.isArray(item.additions) ? item.additions : [];
                      const hasLegacyAdditions =
                        (item.ingredientQuantities && Object.keys(item.ingredientQuantities).length > 0) ||
                        (item.drinkQuantities && Object.keys(item.drinkQuantities).length > 0) ||
                        (item.sauceQuantities && Object.keys(item.sauceQuantities).length > 0) ||
                        item.selectedBreadId;

                      if (additions.length === 0 && !hasLegacyAdditions && !item.meatPoint) return null;

                      return (
                        <div className="mt-3 pl-4 border-l-2 border-gray-300">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Adicionais:</h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            {additions.map((addition, idx) => (
                              <p key={`add-${idx}`}>
                                • {addition.name || addition.adicionalName || `Adicional ${addition.adicionalId}`}: {addition.quantity}x
                              </p>
                            ))}

                            {additions.length === 0 && item.selectedBreadId && (
                              <p>
                                • Pão:{" "}
                                {item.selectedBreadId === 1
                                  ? "Pão de Gergelim"
                                  : item.selectedBreadId === 2
                                    ? "Pão Australiano"
                                    : "Pão de Brioche"}
                              </p>
                            )}

                            {additions.length === 0 && item.ingredientQuantities &&
                              Object.entries(item.ingredientQuantities).map(([id, qty]) => {
                                const ingredient = [
                                  { id: 1, name: "Presunto" },
                                  { id: 2, name: "Bacon" },
                                  { id: 3, name: "Egg" },
                                  { id: 4, name: "Picles" },
                                  { id: 5, name: "Cheddar" },
                                  { id: 6, name: "Catupiry" },
                                  { id: 7, name: "Acebolado" },
                                  { id: 8, name: "Vinagrete" },
                                  { id: 9, name: "Queijo" },
                                ].find(i => i.id === parseInt(id));
                                return ingredient ? <p key={id}>• {ingredient.name}: {qty}x</p> : null;
                              })}

                            {additions.length === 0 && item.drinkQuantities &&
                              Object.entries(item.drinkQuantities).map(([id, qty]) => {
                                const drink = [
                                  { id: 1, name: "Coca Cola" },
                                  { id: 2, name: "Coca Cola Zero" },
                                  { id: 3, name: "Guaraná" },
                                  { id: 4, name: "Guaraná Zero" },
                                  { id: 5, name: "Pepsi" },
                                  { id: 6, name: "Pepsi Twist" },
                                  { id: 7, name: "Soda Limonada" },
                                  { id: 8, name: "Citrus Schweppes" },
                                ].find(d => d.id === parseInt(id));
                                return drink ? <p key={id}>• {drink.name}: {qty}x</p> : null;
                              })}

                            {additions.length === 0 && item.sauceQuantities &&
                              Object.entries(item.sauceQuantities).map(([id, qty]) => {
                                const sauce = [
                                  { id: 1, name: "Maionese" },
                                  { id: 2, name: "Tártaro" },
                                  { id: 3, name: "Maionese de Alho" },
                                ].find(s => s.id === parseInt(id));
                                return sauce ? <p key={id}>• {sauce.name}: {qty}x</p> : null;
                              })}

                            {item.meatPoint && <p>• Ponto da carne: {item.meatPoint}</p>}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

  
                ))}
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
              <div className="pb-6 md:pb-8">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <MapPin size={22} className="shrink-0" />
                  Endereço de Entrega
                </h2>
              </div>
              <div className="space-y-3">
                {loadingAddresses ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Carregando endereços...
                  </div>
                ) : null}

                {!loadingAddresses && addressError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p>{addressError}</p>
                    <button
                      type="button"
                      onClick={loadAddresses}
                      className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : null}

                {!loadingAddresses && !addressError && endUser.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-semibold">Nenhum endereço cadastrado.</p>
                    <p className="mt-1">
                      Adicione um endereço para continuar com a finalização do pedido.
                    </p>
                  </div>
                ) : null}

                {!loadingAddresses && !addressError
                  ? endUser.map((endereco) => (
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
                          onChange={(e) => setEnderecoSelecionado(e.target.value)}
                          className="hidden"
                        />
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                Number(enderecoSelecionado) === endereco.id
                                  ? "border-white"
                                  : "border-gray-400"
                              }`}
                            >
                              {Number(enderecoSelecionado) === endereco.id && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm md:text-base leading-none truncate">
                                {getAddressLabel(endereco)}
                              </p>
                              <p
                                className={`text-sm ${Number(enderecoSelecionado) === endereco.id ? "text-gray-300" : "text-gray-600"}`}
                              ></p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => openDeleteAddressModal(endereco, e)}
                            className={`shrink-0 p-2 rounded-md transition-colors ${
                              Number(enderecoSelecionado) === endereco.id
                                ? "hover:bg-gray-700 text-gray-200"
                                : "hover:bg-red-50 text-red-600"
                            }`}
                            title="Excluir endereço"
                            aria-label="Excluir endereço"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </label>
                    ))
                  : null}

                <AddAddress onCreated={handleAddressCreated} />
              </div>
            </div>

            {/* Observações de Entrega */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
              <div className="pb-6 md:pb-8">
                <h2 className="text-lg md:text-xl font-semibold">Observações de entrega (Opcional)</h2>
              </div>
              <textarea
                value={deliveryObservations}
                onChange={(e) => setDeliveryObservations(e.target.value)}
                placeholder="Ex.: deixar na portaria, chamar no interfone, sem contato..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
              <div className="pb-6 md:pb-8">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <Banknote size={22} className="shrink-0" />
                  Forma de Pagamento
                </h2>
              </div>
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
                  <span>{loadingDeliveryFee ? "Calculando..." : `R$ ${calcularFrete().toFixed(2)}`}</span>
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
                disabled={!Array.isArray(itens) || itens.length === 0 || submitting || !enderecoSelecionado || (businessStatus && !businessStatus.open) || hasActiveOrder}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                Finalizar Pedido
              </button>

              {(!Array.isArray(itens) || itens.length === 0) && (
                <p className="mt-2 text-xs text-amber-600 text-center font-medium">
                  Adicione itens ao pedido para liberar a finalização.
                </p>
              )}

              {!!Array.isArray(itens) && itens.length > 0 && !enderecoSelecionado && (
                <p className="mt-2 text-xs text-amber-600 text-center font-medium">
                  Selecione um endereço para finalizar.
                </p>
              )}

              {businessStatus && !businessStatus.open && (
                <p className="mt-2 text-xs text-red-600 text-center font-medium">
                  ⏰ A loja está fechada. Pedidos podem ser feitos durante o horário de funcionamento.
                </p>
              )}

              {hasActiveOrder && (
                <p className="mt-2 text-xs text-red-600 text-center font-medium">
                  ⚠️ Você possui um pedido ativo. 
                  <button 
                    onClick={() => navigate("/my-orders")}
                    className="ml-1 underline text-red-700 hover:text-red-800"
                  >
                    Clique aqui para gerenciar seus pedidos.
                  </button>
                </p>
              )}

              <div className="mt-4 text-center text-sm text-gray-400">
                <p>🔒 Pagamento seguro</p>
                <p className="mt-1">Seus dados estão protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addressToDelete && (
        <div className="fixed inset-0 z-1000 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900">Excluir endereço</h3>
            <p className="mt-2 text-sm text-gray-600 wrap-break-word">
              Tem certeza que deseja excluir este endereço?
            </p>
            <p className="mt-2 text-sm font-medium text-gray-800 wrap-break-word">
              {getAddressLabel(addressToDelete)}
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteAddressModal}
                disabled={deletingAddress}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAddress}
                disabled={deletingAddress}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deletingAddress ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProgressBar visible={submitting} />

      {/* Tela de Personalização */}
      {isCustomizeOpen && (
        <CustomizeBurger
          item={selectedItem}
          onClose={() => setIsCustomizeOpen(false)}
          onSave={(customizedItem) => {
            const atualizado = itens.map((p) =>
              p.id === customizedItem.id ? { ...p, ...customizedItem } : p,
            );
            setItens(atualizado);
            localStorage.setItem(CHAVE_CART, JSON.stringify(atualizado));
          }}
        />
      )}
    </div>
  );
}
