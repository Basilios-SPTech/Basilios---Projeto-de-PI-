import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/ProfilePage.css";
import EditForm from "../components/EditForm.jsx";
import { http } from "../services/http.js";
import BackButton from "../components/BackButton.jsx";
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

  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchUserProfile() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        const { data } = await http.get("users/me");

        console.log("Perfil do usuário:", data);
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

  const handleSave = async (novosDados) => {
    try {
      // Envia apenas os campos editáveis para o PATCH
      const payload = {
        nomeUsuario: novosDados.nomeUsuario,
        email: novosDados.email,
        telefone: novosDados.telefone,
        dataNascimento: novosDados.dataNascimento,
      };

      const response = await http.patch(`/users/${dados.id}`, payload);

      console.log("Perfil atualizado:", response.data);
      setDados(response.data);
      setIsEditing(null);
      toast.success("Informações atualizadas com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      toast.error(
        err?.response?.data?.message || "Falha ao atualizar informações."
      );
    }
  };

  const abrirEdicao = (secao) => setIsEditing(secao);

  const nav = useNavigate();

  return (
    <>
      <div className="perfil-container">
        <BackButton onClick={() => nav(-1)} className="btn--ghost back-btn">
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </BackButton>
        <h2 className="titulo">Meu perfil</h2>

        {/* WELCOME CARD (replaces original profile/photo card) */}
        <div className="welcome-card">
          <div className="welcome-inner">
            <h3 className="welcome-text">Bem-vindo, {dados.nomeUsuario}!</h3>
            <p className="welcome-sub">Que bom te ver por aqui — revise suas informações abaixo.</p>
          </div>

          {/* username removed from side (kept only welcome text) */}
        </div>

        {/* PERSONAL INFO */}
        <div className="info-card">
          <div className="info-header">
            <h3>Informações Pessoais</h3>
            <button className="edit-btn" onClick={() => abrirEdicao("personal")}>
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
              <p>{dados.data_nascimento ? dados.data_nascimento : "Dados não informados"}</p>
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
