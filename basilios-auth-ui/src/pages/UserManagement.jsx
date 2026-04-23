import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, Search, RefreshCw } from "lucide-react";
import MenuButtonAuto from "../components/MenuButtonAuto.jsx";
import BackButton from "../components/BackButton.jsx";
import { http } from "../services/http.js";

const ADMIN_ROLES = ["ROLE_ADMIN", "ROLE_FUNCIONARIO"];

function normalizeRole(role) {
  const roleName =
    typeof role === "string" ? role : role?.authority || role?.name || "";
  const normalized = String(roleName).trim().toUpperCase();

  if (!normalized) return null;
  if (normalized.startsWith("ROLE_")) return normalized;
  return `ROLE_${normalized}`;
}

function getUserRoles(user) {
  const source = user?.roles || user?.authorities || [];
  if (!Array.isArray(source)) return [];

  const roles = source.map(normalizeRole).filter(Boolean);
  return Array.from(new Set(roles));
}

function normalizeUsersPayload(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.data)) return data.data;

  return [];
}

async function fetchUsersWithFallback() {
  const endpoints = ["/users", "/users/all", "/users/list"];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const { data } = await http.get(endpoint);
      return normalizeUsersPayload(data);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Nao foi possivel buscar usuarios.");
}

async function promoteUserWithFallback(user) {
  const currentRoles = getUserRoles(user);
  const mergedRoles = Array.from(new Set([...currentRoles, ...ADMIN_ROLES]));

  try {
    return await http.patch(`/users/${user.id}`, { roles: mergedRoles });
  } catch (error) {
    throw (
      error ||
      new Error("Nao foi possivel promover o usuario com PATCH /users/{id}.")
    );
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [promotingId, setPromotingId] = useState(null);

  const loadUsers = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const usersData = await fetchUsersWithFallback();
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar usuarios:", error);
      toast.error(error?.message || "Falha ao carregar usuarios.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const name = String(user?.nomeUsuario || user?.name || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      const cpf = String(user?.cpf || "").toLowerCase();
      return name.includes(term) || email.includes(term) || cpf.includes(term);
    });
  }, [users, search]);

  const handlePromote = async (user) => {
    setPromotingId(user.id);

    try {
      await promoteUserWithFallback(user);
      toast.success("Perfil de administrador atribuido com sucesso!");
      await loadUsers(true);
    } catch (error) {
      console.error("Erro ao promover usuario:", error);
      toast.error(
        error?.message || "Nao foi possivel atribuir perfil de administrador.",
      );
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <section className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <MenuButtonAuto />

      <div className="mx-auto max-w-6xl">
        <BackButton className="mb-4" />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Gerenciamento de Usuarios
              </h1>
              <p className="mt-1 text-sm text-slate-600 sm:text-base">
                Promova usuarios cadastrados para perfil administrativo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadUsers(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : undefined}
              />
              Atualizar
            </button>
          </div>

          <div className="relative mt-5">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou CPF"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-center text-slate-600">Carregando usuarios...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-slate-600">
              Nenhum usuario encontrado.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {filteredUsers.map((user) => {
                const roles = getUserRoles(user);
                const isAlreadyAdmin = roles.some((role) =>
                  ADMIN_ROLES.includes(role),
                );

                return (
                  <li
                    key={user.id || user.email}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {user.nomeUsuario || user.name || "Usuario sem nome"}
                      </p>
                      <p className="text-sm text-slate-600">{user.email || "Sem email"}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <span
                              key={`${user.id}-${role}`}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            Sem roles informadas
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePromote(user)}
                      disabled={isAlreadyAdmin || promotingId === user.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                    >
                      <ShieldCheck size={16} />
                      {isAlreadyAdmin
                        ? "Ja e administrador"
                        : promotingId === user.id
                          ? "Atribuindo..."
                          : "Tornar administrador"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
