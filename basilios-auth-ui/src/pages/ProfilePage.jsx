import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/ProfilePage.css";
import EditForm from "../components/EditForm.jsx";
import axios from "axios";
import BackButton from "../components/BackButton.jsx";

export function ProfilePage({
  nome_usuario,
  cpf,
  data_nascimento,
  email,
  telefone,
}) {
  const [isEditing, setIsEditing] = useState(null);

  const [dados, setDados] = useState({
    nome_usuario,
    cpf,
    data_nascimento,
    email,
    telefone,
  });

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setDados(response.data);
      });
  }, []);

  const handleSave = (novosDados) => {
    setDados(novosDados);
    setIsEditing(null);
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
