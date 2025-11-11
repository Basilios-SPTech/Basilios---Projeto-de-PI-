import { useState } from "react";
import "../styles/ProfilePage.css";
import EditForm from "../components/EditForm.jsx";

export function ProfilePage({
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

  const handleSave = (novosDados) => {
    setDados(novosDados);
    setIsEditing(null);
  };

  const abrirEdicao = (secao) => setIsEditing(secao);

  return (
    <div className="perfil-container">
      <h2 className="titulo">Meu perfil</h2>

      {/* PERFIL CARD */}
      <div className="perfil-card">
        <div className="foto-container">
          <img
            src={dados.foto || "/default-avatar.png"}
            alt="Foto de perfil"
            className="perfil-foto"
          />
          <button
            className="edit-btn" onClick={() => abrirEdicao("perfil")}>
              ✏️ Edit
          </button>
        </div>

        <div className="perfil-info-header">
          <h3>
            {dados.nome} {dados.sobrenome}
          </h3>
          <p>{dados.cargo}</p>
          <p>{dados.cidade}, {dados.pais}
          </p>
        </div>
      </div>

      {/* PERSONAL INFO */}
      <div className="info-card">
        <div className="info-header">
          <h3>Personal Information</h3>
          <button className="edit-btn" onClick={() => abrirEdicao("personal")}>
            ✏️ Edit
          </button>
        </div>
        <div className="info-grid">
          <div><span>First Name</span><p>{dados.nome}</p></div>
          <div><span>Last Name</span><p>{dados.sobrenome}</p></div>
          <div><span>Date of Birth</span><p>{dados.nascimento}</p></div>
          <div><span>Email</span><p>{dados.email}</p></div>
          <div><span>Phone</span><p>{dados.telefone}</p></div>
          <div><span>User Role</span><p>{dados.papel}</p></div>
        </div>
      </div>

      {/* ADDRESS INFO */}
      <div className="info-card">
        <div className="info-header">
          <h3>Address</h3>
          <button className="edit-btn" onClick={() => abrirEdicao("address")}>
            ✏️ Edit
          </button>
        </div>
        <div className="info-grid">
          <div><span>Country</span><p>{dados.pais}</p></div>
          <div><span>City</span><p>{dados.cidade}</p></div>
          <div><span>Postal Code</span><p>{dados.cep}</p></div>
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
  );
}
