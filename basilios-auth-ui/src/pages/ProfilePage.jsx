import { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import EditForm from "../components/EditForm.jsx";
import Header from "../components/header.jsx";  
import axios from "axios";



export function ProfilePage(
{
  nome,
  sobrenome,
  cargo,
  cidade,
  pais,
  email,
  telefone,
  nascimento,
  papel,
  cep,
  foto,
}) {
  const [isEditing, setIsEditing] = useState(null);
  const [dados, setDados] = useState({
    nome,
    sobrenome,
    cargo,
    cidade,
    pais,
    email,
    telefone,
    nascimento,
    papel,
    cep,
    foto,
  });

  useEffect(() => {
    // Exemplo de chamada para buscar dados do usuário
    axios.get("http://localhost:8080/api/auth/me", {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBiYXNpbGlvcy5jb20iLCJpYXQiOjE3NjM1MDgwMTksImV4cCI6MTc2MzU5NDQxOX0.pO1FBjyuiSq6wPzq7DDuw5Q3TPzuMP5e0G1jcL5duss)}`,
      },
    }).then((response) => {
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

      {/* PERFIL CARD */}
      <div className="perfil-card">
        <div className="foto-container" color="#860000">
          <img
            src={dados.foto || "/default-avatar.png"}
           
            className="perfil-foto" />
          
        </div>
     

        <div className="perfil-info-header">
          <h3>
            {dados.nome} {dados.sobrenome}
          </h3>
          <p>{dados.cargo}</p>
          <p>{dados.cidade}, {dados.pais}
          </p>
        </div>
           <button
            className="edit-btn" onClick={() => abrirEdicao("perfil")}>
            ✏️ Editar
          </button>
      </div>

      {/* PERSONAL INFO */}
      <div className="info-card">
        <div className="info-header">
          <h3>Informações Pessoais</h3>
          <button className="edit-btn" onClick={() => abrirEdicao("personal")}>
            ✏️ Editar
          </button>
        </div>
        <div className="info-grid">
          <div><span>Nome</span><p>{dados.nome}</p></div>
          <div><span>Sobrenome</span><p>{dados.sobrenome}</p></div>
          <div><span>Nascimento</span><p>{dados.nascimento}</p></div>
          <div><span>Email</span><p>{dados.email}</p></div>
          <div><span>Telefone</span><p>{dados.telefone}</p></div>
          <div><span>Papel</span><p>{dados.papel}</p></div>
        </div>
      </div>

      {/* ADDRESS INFO */}
      <div className="info-card">
        <div className="info-header">
          <h3>Endereço</h3>
          <button className="edit-btn" onClick={() => abrirEdicao("address")}>
            ✏️ Editar
          </button>
        </div>
        <div className="info-grid">
          <div><span>Rua, Número</span><p>{dados.pais}</p></div>
          <div><span>Cidade</span><p>{dados.cidade}</p></div>
          <div><span>CEP</span><p>{dados.cep}</p></div>
        </div>
      </div>

      {/* MODAIS */}
      {isEditing && (
        <EditForm
          secao={isEditing}
          dados={dados}
          onSave={handleSave}
          onCancel={() => setIsEditing(null)} />
      )}
    </div></>
  );
}
