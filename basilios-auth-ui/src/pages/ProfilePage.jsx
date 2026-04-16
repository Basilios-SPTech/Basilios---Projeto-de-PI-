import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldPlus } from "lucide-react";
import "../styles/ProfilePage.css";
import EditForm from "../components/EditForm.jsx";
import { http } from "../services/http.js";
import BackButton from "../components/BackButton.jsx";
import MenuButtonAuto from "../components/MenuButtonAuto.jsx";
import toast from "react-hot-toast";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    id: null,
    nomeUsuario: "",
    email: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    enderecoPrincipalId: null,
    enderecoPrincipal: null,
    roles: [],
    enabled: true,
  });
  const [enderecos, setEnderecos] = useState([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // Estado do formulário de novo admin
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    nomeUsuario: "",
    email: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    senha: "",
  });
  const [adminLoading, setAdminLoading] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchUserProfile() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        const { data } = await http.get("users/me");
        setDados(data);

        console.log("Perfil do usuário:", data);
        const enderecoPrincipal =
          data.enderecoPrincipal ?? data.endereco_principal ?? null;

        setDados({
          ...data,
          dataNascimento: data.dataNascimento ?? data.data_nascimento ?? "",
          enderecoPrincipalId:
            data.enderecoPrincipalId ??
            data.endereco_principal_id ??
            enderecoPrincipal?.id ??
            null,
          enderecoPrincipal,
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        toast.error("Falha ao carregar perfil do usuário.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  // Verifica se o usuário logado é admin
  const isAdmin = dados.roles?.some(
    (role) => role === "ROLE_ADMIN" || role?.authority === "ROLE_ADMIN",
  );

  useEffect(() => {
    async function fetchEnderecos() {
      try {
        const response = await http.get("/address");
        const lista = Array.isArray(response.data) ? response.data : [];
        setEnderecos(lista);
      } catch (err) {
        console.error("Erro ao carregar endereços:", err);
      }
    }

    fetchEnderecos();
  }, []);

  const handleSave = async (novosDados) => {
    try {
      const payload = {
        nomeUsuario: novosDados.nomeUsuario,
        email: novosDados.email,
        telefone: novosDados.telefone,
        data_nascimento: novosDados.dataNascimento,
        endereco_principal_id: novosDados.enderecoPrincipalId
          ? Number(novosDados.enderecoPrincipalId)
          : null,
      };

      const response = await http.patch(`/users/${dados.id}`, payload);

      setDados(response.data);


      console.log("Perfil atualizado:", response.data);
      const responseEnderecoPrincipal =
        response.data.enderecoPrincipal ?? response.data.endereco_principal ?? null;

      setDados((prev) => ({
        ...prev,
        ...response.data,
        dataNascimento:
          response.data.dataNascimento ?? response.data.data_nascimento ?? prev.dataNascimento,
        enderecoPrincipalId:
          response.data.enderecoPrincipalId ??
          response.data.endereco_principal_id ??
          responseEnderecoPrincipal?.id ??
          prev.enderecoPrincipalId,
        enderecoPrincipal: responseEnderecoPrincipal ?? prev.enderecoPrincipal,
      }));
      setIsEditing(null);
      toast.success("Informações atualizadas com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      toast.error(
        err?.response?.data?.message || "Falha ao atualizar informações.",
      );
    }
  };

  const handleAdminFormChange = (e) => {
    setAdminForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      // O JWT é enviado automaticamente pelo interceptor do http (axios)
      await http.post("/users/admin", { ...adminForm, roles: ["ROLE_ADMIN"] });
      toast.success("Novo administrador cadastrado com sucesso!");
      setAdminForm({
        nomeUsuario: "",
        email: "",
        cpf: "",
        telefone: "",
        dataNascimento: "",
        senha: "",
      });
      setShowAdminForm(false);
    } catch (err) {
      console.error("Erro ao criar admin:", err);
      toast.error(
        err?.response?.data?.message || "Falha ao cadastrar administrador.",
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const abrirEdicao = (secao) => setIsEditing(secao);
  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado!");
        return;
      }

      setNewAddress((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 5) {
      value = value.slice(0, 5) + "-" + value.slice(5, 8);
    }

    setNewAddress((prev) => ({ ...prev, cep: value }));

    const cepLimpo = value.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      buscarCep(value);
    }
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenNewAddressForm = () => setShowNewAddressForm(true);
  const handleCloseNewAddressForm = () => {
    setShowNewAddressForm(false);
    setNewAddress({
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    });
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();

    if (!newAddress.cep || !newAddress.rua || !newAddress.numero || !newAddress.bairro || !newAddress.cidade || !newAddress.estado) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSavingAddress(true);
    try {
      const response = await http.post("/address", {
        cep: newAddress.cep,
        rua: newAddress.rua,
        numero: newAddress.numero,
        complemento: newAddress.complemento,
        bairro: newAddress.bairro,
        cidade: newAddress.cidade,
        estado: newAddress.estado,
        latitude: -23.5505,
        longitude: -46.6333,
      });

      const novoEndereco = response.data;
      setEnderecos((prev) => [...prev, novoEndereco]);
      setDados((prev) => ({
        ...prev,
        enderecoPrincipalId: novoEndereco.id,
        enderecoPrincipal: novoEndereco,
      }));
      toast.success("Endereço cadastrado com sucesso!");
      handleCloseNewAddressForm();
    } catch (err) {
      console.error("Erro ao cadastrar endereço:", err);
      toast.error(err?.response?.data?.message || "Erro ao cadastrar endereço.");
    } finally {
      setSavingAddress(false);
    }
  };

  const principalAddressId = Number(
    dados.enderecoPrincipalId ?? dados.endereco_principal_id ?? dados.enderecoPrincipal?.id ?? ""
  );
  const enderecoPrincipalSelecionado = enderecos.find(
    (endereco) => Number(endereco.id) === principalAddressId
  );
  const enderecoPrincipalLabel = enderecoPrincipalSelecionado
    ? `${enderecoPrincipalSelecionado.rua}, ${enderecoPrincipalSelecionado.numero}${enderecoPrincipalSelecionado.complemento ? `, ${enderecoPrincipalSelecionado.complemento}` : ""} - ${enderecoPrincipalSelecionado.bairro}, ${enderecoPrincipalSelecionado.cidade}/${enderecoPrincipalSelecionado.estado}`
    : dados.enderecoPrincipal
    ? `${dados.enderecoPrincipal.rua}, ${dados.enderecoPrincipal.numero}${dados.enderecoPrincipal.complemento ? `, ${dados.enderecoPrincipal.complemento}` : ""} - ${dados.enderecoPrincipal.bairro}, ${dados.enderecoPrincipal.cidade}/${dados.enderecoPrincipal.estado}`
    : Number.isFinite(principalAddressId) && principalAddressId > 0
    ? `ID ${principalAddressId}`
    : "Não informado";

  const nav = useNavigate();

  return (
    <>
      <MenuButtonAuto />
      <div className="perfil-container">
        <BackButton onClick={() => nav(-1)} className="btn--ghost back-btn">
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </BackButton>
        <h2 className="titulo">Meu perfil</h2>

        {/* WELCOME CARD */}
        <div className="welcome-card">
          <div className="welcome-inner">
            <h3 className="welcome-text">Bem-vindo, {dados.nomeUsuario}!</h3>
            <p className="welcome-sub">
              Que bom te ver por aqui — revise suas informações abaixo.
            </p>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="info-card">
          <div className="info-header">
            <h3>Informações Pessoais</h3>
            <button
              className="edit-btn"
              onClick={() => abrirEdicao("personal")}
            >
              Editar
            </button>
          </div>

          <div className="info-grid">
            <div>
              <span>Nome de Usuário</span>
              <p>{dados.nomeUsuario}</p>
            </div>
            <div>
              <span>CPF</span>
              <p>{dados.cpf}</p>
            </div>
            <div>
              <span>Data de Nascimento</span>
              <p>
                {dados.dataNascimento
                  ? dados.dataNascimento
                  : "Dados não informados"}
              </p>

            </div>
            <div>
              <span>Email</span>
              <p>{dados.email}</p>
            </div>
            <div>
              <span>Telefone</span>
              <p>{dados.telefone}</p>
            </div>

            
          </div>
        </div>

        {/* SEÇÃO DE NOVO ADMIN — só renderiza se for ROLE_ADMIN */}
        {isAdmin && (
          <div className="info-card">
            <div className="info-header">
              <h3>
                <ShieldPlus
                  size={18}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />
                Adicionar Administrador
              </h3>
              <button
                className="edit-btn"
                onClick={() => setShowAdminForm((v) => !v)}
              >
                {showAdminForm ? "Fechar" : "Novo Admin"}
              </button>
            </div>

            {showAdminForm && (
              <form className="admin-form" onSubmit={handleCreateAdmin}>
                <div className="info-grid">
                  <div>
                    <label>Nome de Usuário</label>
                    <input
                      name="nomeUsuario"
                      value={adminForm.nomeUsuario}
                      onChange={handleAdminFormChange}
                      placeholder="nome.admin"
                      required
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminFormChange}
                      placeholder="admin@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label>CPF</label>
                    <input
                      name="cpf"
                      value={adminForm.cpf}
                      onChange={handleAdminFormChange}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div>
                    <label>Telefone</label>
                    <input
                      name="telefone"
                      value={adminForm.telefone}
                      onChange={handleAdminFormChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label>Data de Nascimento</label>
                    <input
                      type="date"
                      name="dataNascimento"
                      value={adminForm.dataNascimento}
                      onChange={handleAdminFormChange}
                    />
                  </div>
                  <div>
                    <label>Senha</label>
                    <input
                      type="password"
                      name="senha"
                      value={adminForm.senha}
                      onChange={handleAdminFormChange}
                      placeholder="Senha inicial"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="edit-btn btn--ghost"
                    onClick={() => setShowAdminForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="edit-btn"
                    disabled={adminLoading}
                  >
                    {adminLoading ? "Cadastrando..." : "Cadastrar Admin"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        <div className="info-card">
          <div className="info-header">
            <h3>Endereço Principal da Hamburgueria</h3>
            {!showNewAddressForm ? (
              <button
                type="button"
                className="save-btn"
                onClick={handleOpenNewAddressForm}
              >
                Cadastrar Novo Endereço
              </button>
            ) : null}
          </div>

          {showNewAddressForm && (
            <form className="edit-form" onSubmit={handleSaveNewAddress}>
              <div className="info-grid">
                <div>
                  <label htmlFor="cep">CEP</label>
                  <input
                    id="cep"
                    name="cep"
                    type="text"
                    value={newAddress.cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    disabled={cepLoading || savingAddress}
                  />
                  {cepLoading && (
                    <p className="cep-loading-text">Buscando endereço...</p>
                  )}
                </div>
                <div>
                  <label htmlFor="rua">Rua</label>
                  <input
                    id="rua"
                    name="rua"
                    type="text"
                    value={newAddress.rua}
                    onChange={handleNewAddressChange}
                    placeholder="Rua exemplo"
                  />
                </div>
                <div>
                  <label htmlFor="numero">Número</label>
                  <input
                    id="numero"
                    name="numero"
                    type="text"
                    value={newAddress.numero}
                    onChange={handleNewAddressChange}
                    placeholder="123"
                  />
                </div>
                <div>
                  <label htmlFor="complemento">Complemento</label>
                  <input
                    id="complemento"
                    name="complemento"
                    type="text"
                    value={newAddress.complemento}
                    onChange={handleNewAddressChange}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label htmlFor="bairro">Bairro</label>
                  <input
                    id="bairro"
                    name="bairro"
                    type="text"
                    value={newAddress.bairro}
                    onChange={handleNewAddressChange}
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <label htmlFor="cidade">Cidade</label>
                  <input
                    id="cidade"
                    name="cidade"
                    type="text"
                    value={newAddress.cidade}
                    onChange={handleNewAddressChange}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label htmlFor="estado">Estado</label>
                  <input
                    id="estado"
                    name="estado"
                    type="text"
                    value={newAddress.estado}
                    onChange={handleNewAddressChange}
                    placeholder="SP"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseNewAddressForm}
                >
                  Cancelar
                </button>
                <button type="submit" className="save-btn" disabled={savingAddress}>
                  {savingAddress ? "Salvando..." : "Salvar endereço"}
                </button>
              </div>
            </form>
          )}

          {!showNewAddressForm && (
            <div className="info-grid">
              <div>
                <span>Endereço cadastrado</span>
                <p>{enderecoPrincipalLabel}</p>
              </div>
            </div>
          )}
        </div>

        {/* MODAIS */}
        {isEditing && (
          <EditForm
            secao={isEditing}
            dados={dados}
            enderecos={enderecos}
            onSave={handleSave}
            onNewAddressSaved={(novoEndereco) => {
              if (novoEndereco?.id) {
                setEnderecos((prev) => [...prev, novoEndereco]);
                setDados((prev) => ({
                  ...prev,
                  enderecoPrincipalId: novoEndereco.id,
                  enderecoPrincipal: novoEndereco,
                }));
              }
            }}
            onCancel={() => setIsEditing(null)}
          />
        )}
      </div>
    </>
  );
}
