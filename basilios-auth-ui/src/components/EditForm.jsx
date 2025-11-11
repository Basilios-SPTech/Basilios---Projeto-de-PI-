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

  const camposPorSecao = {
    perfil: ["foto", "nome", "sobrenome", "cargo"],
    personal: ["nome", "sobrenome", "nascimento", "email", "telefone", "papel"],
    address: ["pais", "cidade", "cep"],
  };

  const campos = camposPorSecao[secao] || [];

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>
          {secao === "perfil"
            ? "Editar Perfil"
            : secao === "personal"
            ? "Editar Informações Pessoais"
            : "Editar Endereço"}
        </h3>

        <form onSubmit={handleSubmit}>
          {campos.map((key) => (
            <label key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
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
                  {preview && (
                    <button
                      type="button"
                      className="remove-foto"
                      onClick={() => setPreview("")}
                    >
                      Remover Foto
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  name={key}
                  value={form[key] || ""}
                  onChange={handleChange}
                />
              )}
            </label>
          ))}

          <div className="modal-buttons">
            <button type="submit" className="save-btn">Salvar</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
