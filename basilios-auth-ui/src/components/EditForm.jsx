import { useState } from "react";
import "../styles/EditForm.css";

export default function EditForm({ secao, dados, onSave, onCancel }) {
  const [form, setForm] = useState({ ...dados });
  const [preview, setPreview] = useState(dados.foto || "");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(files[0]);

      setForm((prev) => ({ ...prev, foto: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novosDados = { ...form };

    if (preview) novosDados.foto = preview;
    onSave(novosDados);
  };

  // 🔥 Agora só com seus campos novos
  const camposPorSecao = {
    perfil: ["foto", "nome_usuario"],
    personal: ["nome_usuario", "cpf", "data_nascimento", "email", "telefone"],
  };

  const campos = camposPorSecao[secao] || [];

  return (
    <div className="modal">
      <div className="modal-content zoom-in">

        <h3 className="modal-title">
          {secao === "perfil"
            ? "Editar Perfil"
            : "Editar Informações Pessoais"}
        </h3>

        <form onSubmit={handleSubmit} className="form-container">
          {campos.map((key) => (
            <label key={key} className="form-label">
              {key === "nome_usuario"
                ? "Nome de Usuário"
                : key === "cpf"
                ? "CPF"
                : key === "data_nascimento"
                ? "Data de Nascimento"
                : key === "telefone"
                ? "Telefone"
                : key.charAt(0).toUpperCase() + key.slice(1)}

              {key === "foto" ? (
                <div className="foto-edit-container">
                  {preview && (
                    <img src={preview} alt="Preview" className="foto-preview" />
                  )}
                  <input
                    type="file"
                    name="foto"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="input-with-lock">
                  <input
                    type={key === "data_nascimento" ? "date" : "text"}
                    name={key}
                    value={form[key] || ""}
                    onChange={handleChange}
                    className="form-input"
                    aria-label={key}
                    // CPF and data_nascimento should be read-only for users
                    disabled={key === "cpf" || key === "data_nascimento"}
                    title={
                      key === "cpf" || key === "data_nascimento"
                        ? "Este campo não é editável"
                        : undefined
                    }
                  />

                  {(key === "cpf" || key === "data_nascimento") && (
                    <span className="lock-icon" title="Campo protegido">🔒</span>
                  )}
                </div>
              )}
            </label>
          ))}

          <div className="modal-buttons">
            <button type="submit" className="save-btn">Salvar</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
