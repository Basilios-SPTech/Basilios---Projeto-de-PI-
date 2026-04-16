import { useState } from "react";
import toast from "react-hot-toast";
import { maskPhone, validatePhone } from "../utils/validators.js";
import "../styles/EditForm.css";

export default function EditForm({ secao, dados, onSave, onCancel, enderecos = [], onNewAddressSaved }) {
  const [form, setForm] = useState({
    ...dados,
    dataNascimento: dados.dataNascimento ?? dados.data_nascimento ?? "",
    enderecoPrincipalId:
      dados.enderecoPrincipalId ?? dados.endereco_principal_id ?? "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const nextValue = name === "telefone" ? maskPhone(value) : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (secao === "personal") {
      const phoneValue = form?.telefone || "";
      if (phoneValue && !validatePhone(phoneValue)) {
        toast.error("Telefone inválido. Use DDD + número com 10 ou 11 dígitos.");
        return;
      }
    }

    const novosDados = { ...form };

    // we don't handle photos anymore — keep only fields from form
    onSave(novosDados);
  };

  // Mapeia os campos do novo formato para o formulário
  const camposPorSecao = {
    perfil: ["nomeUsuario"],
    personal: [
      "nomeUsuario",
      "cpf",
      "dataNascimento",
      "email",
      "telefone",
      "enderecoPrincipalId",
    ],
  };

  const campos = camposPorSecao[secao] || [];

  const tituloModal =
    secao === "perfil" ? "Editar Perfil" : "Editar Informações Pessoais";

  return (
    <div className="profile-edit-overlay" onClick={onCancel}>
      <div
        className="profile-edit-modal profile-edit-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-edit-header">
          <h3 className="profile-edit-title">{tituloModal}</h3>
          <button
            type="button"
            className="profile-edit-close"
            onClick={onCancel}
            aria-label="Fechar edição"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          {campos.map((key) => (
            <div key={key}>
              <label className="profile-edit-label">
                <span className="profile-edit-field-title">
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
                    : key === "enderecoPrincipalId"
                    ? "Endereço Principal"
                    : key === "enderecoHamburgueria"
                    ? "Endereço da Hamburgueria"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                </span>

                <div className="profile-edit-input-with-lock">
                  {key === "enderecoPrincipalId" ? (
                    <select
                      name={key}
                      value={form[key] || ""}
                      onChange={handleChange}
                      className="profile-edit-input"
                      aria-label={key}
                    >
                      
                      {enderecos.length === 0 ? (
                        <option value="">Nenhum endereço cadastrado</option>
                      ) : (
                        enderecos.map((endereco) => (
                          <option key={endereco.id} value={endereco.id}>
                            {`${endereco.rua}, ${endereco.numero}${endereco.complemento ? `, ${endereco.complemento}` : ""} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`}
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      type={key === "dataNascimento" ? "date" : "text"}
                      name={key}
                      value={form[key] || ""}
                      onChange={handleChange}
                      className="profile-edit-input"
                      aria-label={key}
                      // CPF and dataNascimento should be read-only for users
                      disabled={key === "cpf" || key === "dataNascimento" || key === "email"}
                      maxLength={key === "telefone" ? 16 : undefined}
                      title={
                        key === "cpf" || key === "dataNascimento" || key === "email"
                          ? "Este campo não é editável"
                          : undefined
                      }
                    />
                  )}

                  {(key === "cpf" || key === "dataNascimento" || key === "email") && (
                    <span className="profile-edit-lock-icon" title="Campo protegido">🔒</span>
                  )}
                </div>
              </label>

            </div>
          ))}

          <div className="profile-edit-actions">
            <button type="button" className="profile-edit-cancel" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="profile-edit-save">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
