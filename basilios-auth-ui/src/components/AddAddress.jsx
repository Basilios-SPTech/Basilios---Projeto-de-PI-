import React, { useState } from "react";
import { Plus, X, Loader2, Frown, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { createAddress } from "../services/addressApi.js";
import { cepDentroDoRaio } from "../utils/deliveryCepPrefixes.js";

const IFOOD_URL =
  "https://www.ifood.com.br/delivery/sao-paulo-sp/basilios-burger-e-acai-vila-deodoro/09e48dd3-82b7-40b6-b5db-99dbf9180291";
const APP_99_URL = "https://oia.99app.com/dlp9/5e0eUu";
const KEETA_URL = "https://url-eu.mykeeta.com/31kF9Klz";

export default function CadastroEndereco({ onSaveSuccess, onCreated }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarForaRaioModal, setMostrarForaRaioModal] = useState(false);
  const [carregandoCep, setCarregandoCep] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoEndereco((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    setCarregandoCep(true);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado!");
        setCarregandoCep(false);
        return;
      }

      setNovoEndereco((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCarregandoCep(false);
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 5) {
      value = value.slice(0, 5) + "-" + value.slice(5, 8);
    }

    setNovoEndereco((prev) => ({
      ...prev,
      cep: value,
    }));

    const cepLimpo = value.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      buscarCep(value);
    }
  };

  const salvarEndereco = async () => {
    if (
      !novoEndereco.cep ||
      !novoEndereco.rua ||
      !novoEndereco.numero ||
      !novoEndereco.bairro ||
      !novoEndereco.cidade ||
      !novoEndereco.estado
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    if (!cepDentroDoRaio(novoEndereco.cep)) {
      setMostrarModal(false);
      setMostrarForaRaioModal(true);
      return;
    }

    setEnviando(true);

    try {
      const body = {
        cep: novoEndereco.cep,
        rua: novoEndereco.rua,
        numero: novoEndereco.numero,
        complemento: novoEndereco.complemento,
        bairro: novoEndereco.bairro,
        cidade: novoEndereco.cidade,
        estado: novoEndereco.estado,
        latitude: -23.5505,
        longitude: -46.6333,
      };

      const createdAddress = await createAddress(body);

      toast.success("Endereço cadastrado com sucesso", { duration: 3000 });
      setMostrarModal(false);

      if (typeof onCreated === "function") {
        onCreated(createdAddress);
      } else if (typeof onSaveSuccess === "function") {
        onSaveSuccess(createdAddress);
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }

      setNovoEndereco({
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      });
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      const backendMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao salvar endereço. Tente novamente.";
      toast.error(backendMessage);
    } finally {
      setEnviando(false);
    }
  };

  const fecharModal = () => {
    setMostrarModal(false);
  };

  const fecharModalForaRaio = () => {
    setMostrarForaRaioModal(false);
  };

  const tentarOutroEndereco = () => {
    setMostrarForaRaioModal(false);
    setMostrarModal(true);
  };

  return (
    <>
      <button
        onClick={() => setMostrarModal(true)}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={24} />
        Cadastrar Novo Endereço
      </button>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Cadastrar Novo Endereço</h2>
              <button
                onClick={fecharModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={enviando}
              >
                <X size={28} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CEP *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cep"
                    value={novoEndereco.cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength="9"
                    disabled={carregandoCep || enviando}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100"
                  />
                  {carregandoCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2
                        className="animate-spin text-gray-600"
                        size={20}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Digite o CEP para preencher automaticamente
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rua *
                </label>
                <input
                  type="text"
                  name="rua"
                  value={novoEndereco.rua}
                  onChange={handleInputChange}
                  placeholder="Nome da rua"
                  disabled={enviando}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    name="numero"
                    value={novoEndereco.numero}
                    onChange={handleInputChange}
                    placeholder="123"
                    disabled={enviando}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complemento"
                    value={novoEndereco.complemento}
                    onChange={handleInputChange}
                    placeholder="Apto, Bloco, etc"
                    disabled={enviando}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  name="bairro"
                  value={novoEndereco.bairro}
                  onChange={handleInputChange}
                  placeholder="Nome do bairro"
                  disabled={enviando}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="cidade"
                    value={novoEndereco.cidade}
                    onChange={handleInputChange}
                    placeholder="Nome da cidade"
                    disabled={enviando}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={novoEndereco.estado}
                    onChange={handleInputChange}
                    disabled={enviando}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">* Campos obrigatórios</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={fecharModal}
                disabled={enviando}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEndereco}
                disabled={enviando || carregandoCep}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Salvando...
                  </>
                ) : (
                  "Salvar Endereço"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarForaRaioModal && (
        <div
          className="fixed inset-0 z-60 bg-black/55 flex items-center justify-center p-4"
          onClick={fecharModalForaRaio}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-red-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Frown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">Ooops...</h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed max-w-[42ch]">
                      O endereço está fora do nosso raio de entrega. Mas calma: você ainda pode
                      pedir pelos aplicativos abaixo ou tentar outro endereço.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fecharModalForaRaio}
                  className="shrink-0 text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3">
              <a
                href={IFOOD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between rounded-2xl bg-[#BB3530] hover:bg-[#a72f2a] text-white px-4 py-3 font-semibold transition-colors shadow-[0_10px_24px_rgba(187,53,48,0.25)]"
              >
                <span>Ir para iFood</span>
                <span className="inline-flex items-center justify-end gap-2 min-w-[138px]">
                  <span className="w-[92px] inline-flex items-center justify-center">
                    <img
                      src="/ifoodPNG.png"
                      alt="iFood"
                      className="h-5 w-auto object-contain"
                      loading="lazy"
                    />
                  </span>
                  <ExternalLink size={16} className="shrink-0" />
                </span>
              </a>

              <a
                href={APP_99_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between rounded-2xl bg-[#FFDD00] hover:bg-[#f3d100] text-black px-4 py-3 font-semibold transition-colors shadow-[0_10px_24px_rgba(255,221,0,0.25)]"
              >
                <span>Ir para 99</span>
                <span className="inline-flex items-center justify-end gap-2 min-w-[138px]">
                  <span className="w-[92px] inline-flex items-center justify-center">
                    <img
                      src="/99PNG.png"
                      alt="99"
                      className="h-8 w-auto object-contain"
                      loading="lazy"
                    />
                  </span>
                  <ExternalLink size={16} className="shrink-0" />
                </span>
              </a>

              <a
                href={KEETA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-3 font-semibold transition-colors shadow-[0_10px_24px_rgba(34,197,94,0.22)]"
              >
                <span>Ir para Keeta</span>
                <span className="inline-flex items-center justify-end gap-2 min-w-[138px]">
                  <span className="w-[92px] inline-flex items-center justify-center">
                    <img
                      src="/keetaPNG.png"
                      alt="Keeta"
                      className="h-10 w-auto max-w-[106px] object-contain"
                      loading="lazy"
                    />
                  </span>
                  <ExternalLink size={16} className="shrink-0" />
                </span>
              </a>
            </div>

            <div className="px-6 pb-6 pt-1 flex gap-3">
              <button
                type="button"
                onClick={fecharModalForaRaio}
                className="flex-1 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 px-4 py-3 font-semibold transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={tentarOutroEndereco}
                className="flex-1 rounded-xl bg-gray-900 hover:bg-black text-white px-4 py-3 font-semibold transition-colors"
              >
                Tentar outro endereço
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
