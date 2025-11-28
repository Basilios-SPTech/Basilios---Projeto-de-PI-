import { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import EditForm from "../components/EditForm.jsx";
import Header from "../components/header.jsx";
import axios from "axios";

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

  return (
    <>
      <Header />
      <div className="perfil-container">
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
              <p>{dados.data_nascimento}</p>
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
