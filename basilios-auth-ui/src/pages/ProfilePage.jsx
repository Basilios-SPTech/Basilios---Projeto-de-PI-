import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldPlus } from "lucide-react";
import "../styles/ProfilePage.css";
import EditForm from "../components/EditForm.jsx";
import { http } from "../services/http.js";
import BackButton from "../components/BackButton.jsx";
import MenuButtonAuto from "../components/MenuButtonAuto.jsx";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/formatters.js";
import {
  getStoreHours,
  getStoreProfile,
  updateStoreHours,
  updateStoreProfile,
} from "../services/storeApi.js";
import { authStorage } from "../services/storageAuth.js";

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

function normalizeRoleName(role) {
  const raw = String(role || "").trim().toUpperCase();
  if (!raw) return "";
  if (raw.startsWith("ROLE_")) return raw;
  if (["ADMIN", "FUNCIONARIO", "CLIENTE"].includes(raw)) {
    return `ROLE_${raw}`;
  }
  return raw;
}

function getRoleNames(roles) {
  if (!Array.isArray(roles)) return [];

  return roles
    .map((role) => {
      if (typeof role === "string") return normalizeRoleName(role);
      if (!role || typeof role !== "object") return "";
      return normalizeRoleName(
        role.authority || role.nome || role.role || role.name || "",
      );
    })
    .filter(Boolean);
}

function normalizeStoreData(store) {
  const source = store && typeof store === "object" ? store : {};
  const deliveryFeeNum = Number(source.deliveryFee);
  const latitudeNum = Number(source.latitude);
  const longitudeNum = Number(source.longitude);

  return {
    name: source.name ?? "",
    address: source.address ?? "",
    phone: source.phone ?? "",
    deliveryFee: Number.isFinite(deliveryFeeNum) ? deliveryFeeNum : null,
    latitude: Number.isFinite(latitudeNum) ? latitudeNum : null,
    longitude: Number.isFinite(longitudeNum) ? longitudeNum : null,
  };
}

function normalizeStoreTime(value) {
  if (!value) return null;
  const text = String(value).trim();
  const match = text.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : null;
}

function createDefaultStoreHours() {
  return STORE_WEEK_DAYS.map((day) => ({
    day_of_week: day,
    is_closed: true,
    opens_at: null,
    closes_at: null,
  }));
}

function normalizeStoreHours(hours) {
  const source = Array.isArray(hours) ? hours : [];
  const byDay = new Map(
    source.map((item) => [String(item?.day_of_week || "").toUpperCase(), item]),
  );

  return STORE_WEEK_DAYS.map((day) => {
    const raw = byDay.get(day) || {};
    const isClosed = Boolean(raw.is_closed);
    const opensAt = normalizeStoreTime(raw.opens_at ?? raw.opensAt);
    const closesAt = normalizeStoreTime(raw.closes_at ?? raw.closesAt);

    return {
      day_of_week: day,
      is_closed: isClosed,
      opens_at: isClosed ? null : opensAt,
      closes_at: isClosed ? null : closesAt,
    };
  });
}

function formatStoreHoursLine(hour) {
  if (!hour) return "Dados nao informados";
  if (hour.is_closed) return "Fechado";
  if (hour.opens_at && hour.closes_at) return `${hour.opens_at} - ${hour.closes_at}`;
  return "Dados nao informados";
}

function parseCurrencyInput(value) {
  const normalized = String(value ?? "")
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}

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
    enderecoPrincipalId: null,
    enderecoPrincipal: null,
    roles: [],
    enabled: true,
  });
  const [storeData, setStoreData] = useState(() => normalizeStoreData(null));
  const [storeHours, setStoreHours] = useState(() => createDefaultStoreHours());
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeHoursLoading, setStoreHoursLoading] = useState(false);
  const [enderecos, setEnderecos] = useState([]);

  // Estado do formulário de novo admin
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    nomeUsuario: "",
    email: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    senha: "",
  });
  const [adminLoading, setAdminLoading] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchUserProfile() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        const { data } = await http.get("users/me");
        setDados(data);

        console.log("Perfil do usuário:", data);
        const enderecoPrincipal =
          data.enderecoPrincipal ?? data.endereco_principal ?? null;

        setDados({
          ...data,
          dataNascimento: data.dataNascimento ?? data.data_nascimento ?? "",
          enderecoPrincipalId:
            data.enderecoPrincipalId ??
            data.endereco_principal_id ??
            enderecoPrincipal?.id ??
            null,
          enderecoPrincipal,
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        toast.error("Falha ao carregar perfil do usuário.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  const roleNames = Array.from(
    new Set([...getRoleNames(dados.roles), ...authStorage.getRoles()]),
  );
  const isAdmin = roleNames.includes("ROLE_ADMIN");
  const isFuncionario = roleNames.includes("ROLE_FUNCIONARIO");
  const canManageStore = isAdmin || isFuncionario;

  useEffect(() => {
    if (isFuncionario) {
      setEnderecos([]);
      return;
    }

    async function fetchEnderecos() {
      try {
        const response = await http.get("/address");
        const lista = Array.isArray(response.data) ? response.data : [];
        setEnderecos(lista);
      } catch (err) {
        console.error("Erro ao carregar endereços:", err);
      }
    }

    fetchEnderecos();
  }, [isFuncionario]);

  useEffect(() => {
    if (!canManageStore) return;

    async function fetchStoreData() {
      try {
        setStoreLoading(true);
        const store = await getStoreProfile();
        setStoreData(normalizeStoreData(store));
      } catch (err) {
        console.error("Erro ao carregar dados da loja:", err);
        toast.error("Não foi possível carregar os dados da loja.");
      } finally {
        setStoreLoading(false);
      }
    }

    fetchStoreData();
  }, [canManageStore]);

  useEffect(() => {
    if (!canManageStore) return;

    async function fetchStoreHoursData() {
      try {
        setStoreHoursLoading(true);
        const hours = await getStoreHours();
        setStoreHours(normalizeStoreHours(hours));
      } catch (err) {
        console.error("Erro ao carregar horarios da loja:", err);
        toast.error("Nao foi possivel carregar os horarios da loja.");
      } finally {
        setStoreHoursLoading(false);
      }
    }

    fetchStoreHoursData();
  }, [canManageStore]);

  const handleSave = async (secao, novosDados) => {
    try {
      if (secao === "store") {
        if (!canManageStore) return;

        const deliveryFee = parseCurrencyInput(novosDados.storeDeliveryFee);
        const nextHours = normalizeStoreHours(novosDados.storeHours);
        const hoursPayload = [];

        if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
          toast.error("Taxa de entrega inválida.");
          return;
        }

        for (const item of nextHours) {
          const dayLabel = STORE_DAY_LABELS[item.day_of_week] || item.day_of_week;
          const opensAt = normalizeStoreTime(item.opens_at);
          const closesAt = normalizeStoreTime(item.closes_at);

          if (item.is_closed) {
            hoursPayload.push({
              day_of_week: item.day_of_week,
              is_closed: true,
              opens_at: null,
              closes_at: null,
            });
            continue;
          }

          if (!opensAt || !closesAt) {
            toast.error(`Preencha abertura e fechamento de ${dayLabel}.`);
            return;
          }

          if (closesAt <= opensAt) {
            toast.error(`No dia ${dayLabel}, fechamento deve ser maior que abertura.`);
            return;
          }

          hoursPayload.push({
            day_of_week: item.day_of_week,
            is_closed: false,
            opens_at: opensAt,
            closes_at: closesAt,
          });
        }

        const storePayload = {
          name: String(novosDados.storeName || "").trim(),
          address: String(novosDados.storeAddress || "").trim(),
          phone: String(novosDados.storePhone || "").trim(),
          deliveryFee,
        };

        if (Number.isFinite(Number(storeData.latitude))) {
          storePayload.latitude = Number(storeData.latitude);
        }

        if (Number.isFinite(Number(storeData.longitude))) {
          storePayload.longitude = Number(storeData.longitude);
        }

        const updatedStore = await updateStoreProfile(storePayload);
        const updatedHours = await updateStoreHours({ hours: hoursPayload });
        setStoreData(normalizeStoreData(updatedStore || { ...storeData, ...storePayload }));
        setStoreHours(normalizeStoreHours(updatedHours.length ? updatedHours : hoursPayload));
        setIsEditing(null);
        toast.success("Informações da loja atualizadas com sucesso!");
        return;
      }

      const payload = {
        nomeUsuario: novosDados.nomeUsuario,
        email: novosDados.email,
        telefone: novosDados.telefone,
        data_nascimento: novosDados.dataNascimento,
      };

      if (Object.prototype.hasOwnProperty.call(novosDados, "enderecoPrincipalId")) {
        payload.endereco_principal_id = novosDados.enderecoPrincipalId
          ? Number(novosDados.enderecoPrincipalId)
          : null;
      }

      const response = await http.patch(`/users/${dados.id}`, payload);

      setDados(response.data);


      console.log("Perfil atualizado:", response.data);
      const responseEnderecoPrincipal =
        response.data.enderecoPrincipal ?? response.data.endereco_principal ?? null;

      setDados((prev) => ({
        ...prev,
        ...response.data,
        dataNascimento:
          response.data.dataNascimento ?? response.data.data_nascimento ?? prev.dataNascimento,
        enderecoPrincipalId:
          response.data.enderecoPrincipalId ??
          response.data.endereco_principal_id ??
          responseEnderecoPrincipal?.id ??
          prev.enderecoPrincipalId,
        enderecoPrincipal: responseEnderecoPrincipal ?? prev.enderecoPrincipal,
      }));

      setIsEditing(null);
      toast.success("Informações atualizadas com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      toast.error(
        err?.response?.data?.message || "Falha ao atualizar informações.",
      );
    }
  };

  const handleAdminFormChange = (e) => {
    setAdminForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      // O JWT é enviado automaticamente pelo interceptor do http (axios)
      await http.post("/users/admin", { ...adminForm, roles: ["ROLE_ADMIN"] });
      toast.success("Novo administrador cadastrado com sucesso!");
      setAdminForm({
        nomeUsuario: "",
        email: "",
        cpf: "",
        telefone: "",
        dataNascimento: "",
        senha: "",
      });
      setShowAdminForm(false);
    } catch (err) {
      console.error("Erro ao criar admin:", err);
      toast.error(
        err?.response?.data?.message || "Falha ao cadastrar administrador.",
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const abrirEdicao = (secao) => setIsEditing(secao);

  const nav = useNavigate();

  return (
    <>
      <MenuButtonAuto />
      <div className="perfil-container">
        <BackButton onClick={() => nav(-1)} className="btn--ghost back-btn">
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </BackButton>
        <h2 className="titulo">Meu perfil</h2>

        {/* WELCOME CARD */}
        <div className="welcome-card">
          <div className="welcome-inner">
            <h3 className="welcome-text">Bem-vindo, {dados.nomeUsuario}!</h3>
            <p className="welcome-sub">
              Que bom te ver por aqui — revise suas informações abaixo.
            </p>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="info-card">
          <div className="info-header">
            <h3>Informações Pessoais</h3>
            <button
              className="edit-btn"
              onClick={() => abrirEdicao("personal")}
            >
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
              <p>
                {dados.dataNascimento
                  ? dados.dataNascimento
                  : "Dados não informados"}
              </p>

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

        {canManageStore && (
          <div className="info-card">
            <div className="info-header">
              <h3>Informações da Loja</h3>
              <button
                className="edit-btn"
                onClick={() => abrirEdicao("store")}
              >
                Editar
              </button>
            </div>

            <div className="info-grid">
                <div>
                  <span>Nome da Loja</span>
                  <p>{storeData.name || "Dados não informados"}</p>
                </div>
                <div>
                  <span>Endereço da Loja</span>
                  <p>{storeData.address || "Dados não informados"}</p>
                </div>
                <div>
                  <span>Telefone da Loja</span>
                  <p>{storeData.phone || "Dados não informados"}</p>
                </div>
                <div>
                  <span>Taxa de Entrega</span>
                  <p>
                    {storeData.deliveryFee != null
                      ? formatCurrency(storeData.deliveryFee)
                      : "Dados não informados"}
                  </p>
                </div>

                <div className="store-hours-summary">
                  <span>Horarios de Funcionamento</span>
                  <div className="store-hours-stack">
                    {storeHours.map((hour) => (
                      <p key={hour.day_of_week} className="store-hours-line">
                        <strong>{STORE_DAY_LABELS[hour.day_of_week]}:</strong>{" "}
                        {formatStoreHoursLine(hour)}
                      </p>
                    ))}
                  </div>
                </div>

                {storeLoading && (
                  <div>
                    <span>Status</span>
                    <p>Carregando informações da loja...</p>
                  </div>
                )}
                {storeHoursLoading && (
                  <div>
                    <span>Status</span>
                    <p>Carregando horarios da loja...</p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* SEÇÃO DE NOVO ADMIN — só renderiza se for ROLE_ADMIN */}
        {isAdmin && (
          <div className="info-card">
            <div className="info-header">
              <h3>
                <ShieldPlus
                  size={18}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />
                Adicionar Administrador
              </h3>
              <button
                className="edit-btn"
                onClick={() => setShowAdminForm((v) => !v)}
              >
                {showAdminForm ? "Fechar" : "Novo Admin"}
              </button>
              <button
                className="edit-btn btn--ghost"
                onClick={() => nav("/gerenciar-usuarios")}
              >
                Gerenciar Usuários
              </button>
            </div>

            {showAdminForm && (
              <form className="admin-form" onSubmit={handleCreateAdmin}>
                <div className="info-grid">
                  <div>
                    <label>Nome de Usuário</label>
                    <input
                      name="nomeUsuario"
                      value={adminForm.nomeUsuario}
                      onChange={handleAdminFormChange}
                      placeholder="nome.admin"
                      required
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminFormChange}
                      placeholder="admin@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label>CPF</label>
                    <input
                      name="cpf"
                      value={adminForm.cpf}
                      onChange={handleAdminFormChange}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div>
                    <label>Telefone</label>
                    <input
                      name="telefone"
                      value={adminForm.telefone}
                      onChange={handleAdminFormChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label>Data de Nascimento</label>
                    <input
                      type="date"
                      name="dataNascimento"
                      value={adminForm.dataNascimento}
                      onChange={handleAdminFormChange}
                    />
                  </div>
                  <div>
                    <label>Senha</label>
                    <input
                      type="password"
                      name="senha"
                      value={adminForm.senha}
                      onChange={handleAdminFormChange}
                      placeholder="Senha inicial"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="edit-btn btn--ghost"
                    onClick={() => setShowAdminForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="edit-btn"
                    disabled={adminLoading}
                  >
                    {adminLoading ? "Cadastrando..." : "Cadastrar Admin"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        {/* MODAIS */}
        {isEditing && (
          <EditForm
            secao={isEditing}
            dados={dados}
            enderecos={enderecos}
            onSave={handleSave}
            isFuncionario={isFuncionario}
            canManageStore={canManageStore}
            storeData={storeData}
            storeHours={storeHours}
            onCancel={() => setIsEditing(null)}
          />
        )}
      </div>
    </>
  );
}
