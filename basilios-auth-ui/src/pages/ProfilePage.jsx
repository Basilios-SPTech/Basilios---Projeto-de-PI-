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
    roles: [],
    enabled: true,
  });

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

  const handleSave = async (novosDados) => {
    try {
      const payload = {
        nomeUsuario: novosDados.nomeUsuario,
        email: novosDados.email,
        telefone: novosDados.telefone,
        dataNascimento: novosDados.dataNascimento,
      };

      const response = await http.patch(`/users/${dados.id}`, payload);
      setDados(response.data);
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

        {/* MODAIS */}
        {isEditing && (
          <EditForm
            secao={isEditing}
            dados={dados}
            onSave={handleSave}
            onCancel={() => setIsEditing(null)}
          />
        )}
      </div>
    </>
  );
}
