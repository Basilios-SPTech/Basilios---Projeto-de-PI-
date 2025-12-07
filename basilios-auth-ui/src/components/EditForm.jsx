import { useState } from "react";
import toast from "react-hot-toast";
import "../styles/EditForm.css";

export default function EditForm({ secao, dados, onSave, onCancel }) {
  const [form, setForm] = useState({ ...dados });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novosDados = { ...form };

    // we don't handle photos anymore — keep only fields from form
    onSave(novosDados);
    toast.success("Informações salvas com sucesso!");
  };

  // Mapeia os campos do novo formato para o formulário
  const camposPorSecao = {
    perfil: ["nomeUsuario"],
    personal: ["nomeUsuario", "cpf", "dataNascimento", "email", "telefone"],
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
              <span className="field-title">
                {key === "nomeUsuario"
                  ? "Nome de Usuário"
                  : key === "cpf"
                  ? "CPF"
                  : key === "dataNascimento"
                  ? "Data de Nascimento"
                  : key === "telefone"
                  ? "Telefone"
                  : key === "email"
                  ? "Email"
                  : key.charAt(0).toUpperCase() + key.slice(1)}
              </span>

              
                <div className="input-with-lock">
                  <input
                    type={key === "dataNascimento" ? "date" : "text"}
                    name={key}
                    value={form[key] || ""}
                    onChange={handleChange}
                    className="form-input"
                    aria-label={key}
                    // CPF and dataNascimento should be read-only for users
                    disabled={key === "cpf" || key === "dataNascimento"}
                    title={
                      key === "cpf" || key === "dataNascimento"
                        ? "Este campo não é editável"
                        : undefined
                    }
                  />

                  {(key === "cpf" || key === "dataNascimento") && (
                    <span className="lock-icon" title="Campo protegido">🔒</span>
                  )}
                </div>
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
