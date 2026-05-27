import { useState } from "react";
import toast from "react-hot-toast";
import { maskPhone, validatePhone } from "../utils/validators.js";
import "../styles/EditForm.css";

const STORE_WEEK_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const STORE_DAY_LABELS = {
  MONDAY: "Segunda",
  TUESDAY: "Terca",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sabado",
  SUNDAY: "Domingo",
};

function formatCurrencyInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  const amount = Number(digits) / 100;
  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function composeStoreAddress(address) {
  const cep = String(address?.cep || "").trim();
  const rua = String(address?.rua || "").trim();
  const numero = String(address?.numero || "").trim();
  const complemento = String(address?.complemento || "").trim();
  const bairro = String(address?.bairro || "").trim();
  const cidade = String(address?.cidade || "").trim();
  const estado = String(address?.estado || "").trim().toUpperCase();

  const lineOne = `${rua}, ${numero}${complemento ? `, ${complemento}` : ""}`;
  const lineTwo = `${bairro}, ${cidade}/${estado}`;
  return `${lineOne} - ${lineTwo}${cep ? ` - CEP ${cep}` : ""}`;
}

function normalizeStoreTime(value) {
  if (!value) return "";
  const text = String(value).trim();
  const match = text.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function normalizeStoreHours(hours) {
  const source = Array.isArray(hours) ? hours : [];
  const byDay = new Map(
    source.map((item) => [String(item?.day_of_week || "").toUpperCase(), item]),
  );

  return STORE_WEEK_DAYS.map((day) => {
    const raw = byDay.get(day) || {};
    const isClosed = Boolean(raw.is_closed);

    return {
      day_of_week: day,
      is_closed: isClosed,
      opens_at: isClosed ? "" : normalizeStoreTime(raw.opens_at ?? raw.opensAt),
      closes_at: isClosed ? "" : normalizeStoreTime(raw.closes_at ?? raw.closesAt),
    };
  });
}

export default function EditForm({
  secao,
  dados,
  onSave,
  onCancel,
  enderecos = [],
  isFuncionario = false,
  canManageStore = false,
  storeData = null,
  storeHours = [],
}) {
  const [form, setForm] = useState({
    ...dados,
    dataNascimento: dados.dataNascimento ?? dados.data_nascimento ?? "",
    enderecoPrincipalId:
      dados.enderecoPrincipalId ?? dados.endereco_principal_id ?? "",
    storeName: storeData?.name ?? "",
    storeAddress: storeData?.address ?? "",
    storePhone: storeData?.phone ?? "",
    storeDeliveryFee:
      storeData?.deliveryFee == null ? "" : formatCurrencyInput(storeData.deliveryFee),
    storeHours: normalizeStoreHours(storeHours),
  });

  const [showStoreAddressModal, setShowStoreAddressModal] = useState(false);
  const [storeCepLoading, setStoreCepLoading] = useState(false);
  const [storeAddressForm, setStoreAddressForm] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    if (name === "telefone" || name === "storePhone") {
      nextValue = maskPhone(value);
    } else if (name === "storeDeliveryFee") {
      nextValue = formatCurrencyInput(value);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleStoreAddressFieldChange = (e) => {
    const { name, value } = e.target;
    setStoreAddressForm((prev) => ({
      ...prev,
      [name]: name === "cep" ? maskCep(value) : value,
    }));
  };

  const handleStoreHourChange = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      storeHours: (prev.storeHours || []).map((item) => {
        if (item.day_of_week !== day) return item;

        if (field === "is_closed") {
          const isClosed = Boolean(value);
          return {
            ...item,
            is_closed: isClosed,
            opens_at: isClosed ? "" : item.opens_at,
            closes_at: isClosed ? "" : item.closes_at,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    }));
  };

  const buscarCepLoja = async (cep) => {
    const cepLimpo = String(cep || "").replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setStoreCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data?.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      setStoreAddressForm((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP da loja:", err);
      toast.error("Erro ao consultar CEP da loja.");
    } finally {
      setStoreCepLoading(false);
    }
  };

  const handleStoreCepBlur = () => {
    buscarCepLoja(storeAddressForm.cep);
  };

  const handleStoreAddressConfirm = () => {
    const required = [
      ["cep", "CEP"],
      ["rua", "Rua"],
      ["numero", "Número"],
      ["bairro", "Bairro"],
      ["cidade", "Cidade"],
      ["estado", "Estado"],
    ];

    const missing = required.find(
      ([field]) => !String(storeAddressForm[field] || "").trim(),
    );

    if (missing) {
      toast.error(`Preencha o campo obrigatório: ${missing[1]}.`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      storeAddress: composeStoreAddress(storeAddressForm),
    }));
    setShowStoreAddressModal(false);
  };

  const openStoreAddressModal = () => {
    setShowStoreAddressModal(true);
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

    if (secao === "store" && canManageStore) {
      const requiredStoreFields = [
        ["storeName", "Nome da loja"],
        ["storeAddress", "Endereço da loja"],
        ["storePhone", "Telefone da loja"],
        ["storeDeliveryFee", "Taxa de entrega"],
      ];

      const missing = requiredStoreFields.find(
        ([field]) => !String(form[field] || "").trim(),
      );

      if (missing) {
        toast.error(`Preencha o campo obrigatório: ${missing[1]}.`);
        return;
      }

      if (form.storePhone && !validatePhone(form.storePhone)) {
        toast.error("Telefone da loja inválido. Use DDD + número com 10 ou 11 dígitos.");
        return;
      }

      for (const item of form.storeHours || []) {
        const dayLabel = STORE_DAY_LABELS[item.day_of_week] || item.day_of_week;

        if (item.is_closed) continue;

        if (!item.opens_at || !item.closes_at) {
          toast.error(`Preencha abertura e fechamento de ${dayLabel}.`);
          return;
        }

        if (item.closes_at <= item.opens_at) {
          toast.error(`No dia ${dayLabel}, fechamento deve ser maior que abertura.`);
          return;
        }
      }
    }

    const novosDados = { ...form };

    // we don't handle photos anymore — keep only fields from form
    onSave(secao, novosDados);
  };

  // Mapeia os campos do novo formato para o formulário
  const camposPorSecao = {
    perfil: ["nomeUsuario"],
    personal: isFuncionario
      ? ["nomeUsuario", "cpf", "dataNascimento", "email", "telefone"]
      : [
          "nomeUsuario",
          "cpf",
          "dataNascimento",
          "email",
          "telefone",
          "enderecoPrincipalId",
        ],
    store: [],
  };

  const campos = camposPorSecao[secao] || [];

  const tituloModal =
    secao === "perfil"
      ? "Editar Perfil"
      : secao === "store"
        ? "Editar Informações da Loja"
        : "Editar Informações Pessoais";

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

          {secao === "store" && canManageStore && (
            <div className="profile-edit-section">
              <h4 className="profile-edit-section-title">Informações da loja</h4>
              <p className="profile-edit-help">
                Esses dados serão enviados para o endpoint de atualização da loja.
              </p>

              <label className="profile-edit-label">
                <span className="profile-edit-field-title">Nome da Loja</span>
                <input
                  type="text"
                  name="storeName"
                  value={form.storeName || ""}
                  onChange={handleChange}
                  className="profile-edit-input"
                  placeholder="Ex.: Basilios Hamburgueria"
                />
              </label>

              <div className="profile-edit-label">
                <span className="profile-edit-field-title">Endereço da Loja</span>
                <div className="profile-edit-address-box">
                  <p className="profile-edit-address-preview">
                    {form.storeAddress || "Nenhum endereço definido."}
                  </p>
                  <button
                    type="button"
                    className="profile-edit-address-btn"
                    onClick={openStoreAddressModal}
                  >
                    Editar endereço com CEP
                  </button>
                </div>
              </div>

              <label className="profile-edit-label">
                <span className="profile-edit-field-title">Telefone da Loja</span>
                <input
                  type="text"
                  name="storePhone"
                  value={form.storePhone || ""}
                  onChange={handleChange}
                  className="profile-edit-input"
                  maxLength={16}
                  placeholder="(11) 99999-9999"
                />
              </label>

              <label className="profile-edit-label">
                <span className="profile-edit-field-title">Taxa de Entrega (R$)</span>
                <input
                  type="text"
                  name="storeDeliveryFee"
                  value={form.storeDeliveryFee || ""}
                  onChange={handleChange}
                  className="profile-edit-input"
                  inputMode="decimal"
                  placeholder="Ex.: 7,90"
                />
              </label>

              <div className="profile-edit-hours-wrapper">
                <span className="profile-edit-field-title">Horario de Funcionamento</span>

                {(form.storeHours || []).map((item) => (
                  <div className="profile-edit-hours-row" key={item.day_of_week}>
                    <strong className="profile-edit-hours-day">
                      {STORE_DAY_LABELS[item.day_of_week] || item.day_of_week}
                    </strong>

                    <label className="profile-edit-hours-closed-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(item.is_closed)}
                        onChange={(e) =>
                          handleStoreHourChange(item.day_of_week, "is_closed", e.target.checked)
                        }
                      />
                      Fechado
                    </label>

                    <input
                      type="time"
                      value={item.opens_at || ""}
                      onChange={(e) =>
                        handleStoreHourChange(item.day_of_week, "opens_at", e.target.value)
                      }
                      className="profile-edit-input profile-edit-hours-input"
                      disabled={Boolean(item.is_closed)}
                    />

                    <input
                      type="time"
                      value={item.closes_at || ""}
                      onChange={(e) =>
                        handleStoreHourChange(item.day_of_week, "closes_at", e.target.value)
                      }
                      className="profile-edit-input profile-edit-hours-input"
                      disabled={Boolean(item.is_closed)}
                    />
                  </div>
                ))}
              </div>

              <p className="profile-edit-hint">
                Em dias fechados, abertura e fechamento ficam vazios.
              </p>
            </div>
          )}

          <div className="profile-edit-actions">
            <button type="button" className="profile-edit-cancel" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="profile-edit-save">Salvar</button>
          </div>
        </form>

        {showStoreAddressModal && (
          <div className="profile-edit-suboverlay" onClick={() => setShowStoreAddressModal(false)}>
            <div className="profile-edit-submodal" onClick={(e) => e.stopPropagation()}>
              <div className="profile-edit-submodal-header">
                <h4>Endereço da loja</h4>
                <button
                  type="button"
                  className="profile-edit-close"
                  onClick={() => setShowStoreAddressModal(false)}
                  aria-label="Fechar modal de endereço"
                >
                  ✕
                </button>
              </div>

              <div className="profile-edit-submodal-body">
                <label className="profile-edit-label">
                  <span className="profile-edit-field-title">CEP</span>
                  <input
                    type="text"
                    name="cep"
                    value={storeAddressForm.cep}
                    onChange={handleStoreAddressFieldChange}
                    onBlur={handleStoreCepBlur}
                    className="profile-edit-input"
                    placeholder="00000-000"
                    maxLength={9}
                    inputMode="numeric"
                  />
                </label>

                <label className="profile-edit-label">
                  <span className="profile-edit-field-title">Rua</span>
                  <input
                    type="text"
                    name="rua"
                    value={storeAddressForm.rua}
                    onChange={handleStoreAddressFieldChange}
                    className="profile-edit-input"
                    placeholder="Rua da loja"
                  />
                </label>

                <div className="profile-edit-subgrid">
                  <label className="profile-edit-label">
                    <span className="profile-edit-field-title">Número</span>
                    <input
                      type="text"
                      name="numero"
                      value={storeAddressForm.numero}
                      onChange={handleStoreAddressFieldChange}
                      className="profile-edit-input"
                      placeholder="123"
                    />
                  </label>

                  <label className="profile-edit-label">
                    <span className="profile-edit-field-title">Complemento</span>
                    <input
                      type="text"
                      name="complemento"
                      value={storeAddressForm.complemento}
                      onChange={handleStoreAddressFieldChange}
                      className="profile-edit-input"
                      placeholder="Opcional"
                    />
                  </label>
                </div>

                <div className="profile-edit-subgrid">
                  <label className="profile-edit-label">
                    <span className="profile-edit-field-title">Bairro</span>
                    <input
                      type="text"
                      name="bairro"
                      value={storeAddressForm.bairro}
                      onChange={handleStoreAddressFieldChange}
                      className="profile-edit-input"
                      placeholder="Centro"
                    />
                  </label>

                  <label className="profile-edit-label">
                    <span className="profile-edit-field-title">Cidade</span>
                    <input
                      type="text"
                      name="cidade"
                      value={storeAddressForm.cidade}
                      onChange={handleStoreAddressFieldChange}
                      className="profile-edit-input"
                      placeholder="Sao Paulo"
                    />
                  </label>
                </div>

                <label className="profile-edit-label">
                  <span className="profile-edit-field-title">Estado (UF)</span>
                  <input
                    type="text"
                    name="estado"
                    value={storeAddressForm.estado}
                    onChange={handleStoreAddressFieldChange}
                    className="profile-edit-input"
                    placeholder="SP"
                    maxLength={2}
                  />
                </label>

                {storeCepLoading && (
                  <p className="profile-edit-hint">Buscando dados do CEP...</p>
                )}
              </div>

              <div className="profile-edit-actions">
                <button
                  type="button"
                  className="profile-edit-cancel"
                  onClick={() => setShowStoreAddressModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="profile-edit-save"
                  onClick={handleStoreAddressConfirm}
                >
                  Usar endereço
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
