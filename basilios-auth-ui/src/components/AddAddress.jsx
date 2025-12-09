import React, { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import axios from "axios";

export default function CadastroEndereco() {
  const [mostrarModal, setMostrarModal] = useState(false);
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
        alert("CEP não encontrado!");
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
      alert("Erro ao buscar CEP. Tente novamente.");
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

    setEnviando(true);

    try {
      console.log("Dados enviados:", novoEndereco);

      // Código real com axios:

      let body = {
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

      const response = await axios.post("http://localhost:8080/address", body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      console.log(response);
      if (response.status == 201) {
        toast.success("Endereço cadastrado com sucesso", { duration: 3000 });
        setTimeout(() => {
          setMostrarModal(false);
          window.location.reload();
        }, 3500);
      } else {
        toast.error("Erro ao cadastrar endereço");
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
      alert("Erro ao salvar endereço. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const fecharModal = () => {
    setMostrarModal(false);
  };

  return (
    <>
      <button
        onClick={() => setMostrarModal(true)}
        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
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
    </>
  );
}
