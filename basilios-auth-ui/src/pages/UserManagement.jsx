import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, ShieldAlert, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton.jsx";
import MenuButtonAdm from "../components/MenuButtonAdm.jsx";
import { http } from "../services/http.js";
import { authStorage } from "../services/storageAuth.js";
import "../styles/user-management.css";

function normalizeRole(role) {
  if (!role) return "";
  let raw = "";

  if (typeof role === "string") {
    raw = role;
  } else {
    raw = String(role.authority || role.nome || role.role || "");
  }

  let up = raw.trim().toUpperCase();
  if (!up.startsWith("ROLE_") && /^(ADMIN|CLIENTE|FUNCIONARIO)$/.test(up)) {
    up = `ROLE_${up}`;
  }

  return up;
}

function extractRoles(user) {
  const fromRoles = Array.isArray(user?.roles) ? user.roles : [];
  const fromAuthorities = Array.isArray(user?.authorities) ? user.authorities : [];
  const fromRole = user?.role ? [user.role] : [];
  const fromScope = typeof user?.scope === "string" ? user.scope.split(/\s+/) : [];

  return Array.from(
    new Set([...fromRoles, ...fromAuthorities, ...fromRole, ...fromScope]
      .map(normalizeRole)
      .filter(Boolean)),
  );
}

function hasAdminRole(user) {
  return extractRoles(user).some((role) => role === "ROLE_ADMIN" || role === "ADMIN");
}

function parseUsersPayload(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function fetchUsers() {
  const endpoints = [
    { url: "/users", config: { params: { page: 0, size: 200 } } },
    { url: "/users", config: undefined },
    { url: "/users/all", config: undefined },
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await http.get(endpoint.url, endpoint.config);
      return parseUsersPayload(response.data);
    } catch (err) {
      lastError = err;
      if (![404, 405].includes(err?.status)) {
        break;
      }
    }
  }

  throw lastError || new Error("Não foi possível carregar usuários.");
}

async function updateUserRoles(userId, nextRoles) {
  return http.patch(`/users/${userId}/roles`, { roles: nextRoles });
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const tokenRoles = authStorage.getRoles();
  const tokenSaysAdmin = authStorage.hasAnyRole("ROLE_ADMIN");
  const [isAdmin, setIsAdmin] = useState(tokenSaysAdmin);

  useEffect(() => {
    let active = true;

    async function resolveAccessByProfile() {
      try {
        setCheckingAccess(true);
        const { data } = await http.get("/users/me");
        const meRoles = extractRoles(data);
        const meIsAdmin = meRoles.includes("ROLE_ADMIN");
        if (active) {
          setIsAdmin(meIsAdmin || tokenSaysAdmin);
          setCurrentUserId(data?.id ?? null);
        }
      } catch {
        // fallback para token local quando users/me falhar
        if (active) setIsAdmin(tokenSaysAdmin);
      } finally {
        if (active) setCheckingAccess(false);
      }
    }

    resolveAccessByProfile();
    return () => {
      active = false;
    };
  }, [tokenSaysAdmin]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setAccessDenied(false);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      if (err?.status === 403) {
        setAccessDenied(true);
        setUsers([]);
        toast.error("Seu usuário não tem permissão para listar perfis.");
      } else {
        toast.error(err?.message || "Falha ao carregar usuários cadastrados.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin, loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const source = [
        user?.nomeUsuario,
        user?.name,
        user?.username,
        user?.email,
        user?.cpf,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return source.includes(term);
    });
  }, [query, users]);

  const adminCount = useMemo(
    () => users.filter((user) => hasAdminRole(user)).length,
    [users],
  );

  const handleToggleAdmin = async (user) => {
    const userId = user?.id ?? user?.userId;
    if (!userId) {
      toast.error("Usuário sem identificador válido.");
      return;
    }

    const currentRoles = extractRoles(user);
    const alreadyAdmin = currentRoles.includes("ROLE_ADMIN") || currentRoles.includes("ADMIN");
    const isSelf = currentUserId !== null && Number(userId) === Number(currentUserId);

    if (alreadyAdmin && isSelf) {
      toast.error("Não é permitido remover o perfil de admin do seu próprio usuário.");
      return;
    }

    let nextRoles = [];

    if (alreadyAdmin) {
      nextRoles = currentRoles.filter((role) => normalizeRole(role) !== "ROLE_ADMIN");
      if (nextRoles.length === 0) {
        nextRoles = ["ROLE_CLIENTE"];
      }
    } else {
      nextRoles = Array.from(new Set([...currentRoles, "ROLE_ADMIN"]));
    }

    try {
      setSavingId(userId);
      await updateUserRoles(userId, nextRoles);

      setUsers((prev) =>
        prev.map((item) =>
          (item?.id ?? item?.userId) === userId
            ? {
                ...item,
                roles: nextRoles,
              }
            : item,
        ),
      );

      toast.success(alreadyAdmin ? "Perfil de administrador removido com sucesso!" : "Perfil de administrador atribuído com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil do usuário:", err);
      toast.error(err?.message || "Falha ao atualizar perfis do usuário.");
    } finally {
      setSavingId(null);
    }
  };

  if (checkingAccess) {
    return (
      <main className="users-mgmt-root">
        <MenuButtonAdm />
        <div className="users-mgmt-shell">
          <BackButton onClick={() => navigate(-1)} className="btn--ghost back-btn">
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </BackButton>

          <section className="users-mgmt-card users-mgmt-card--warning">
            <h2>Validando permissões</h2>
            <p>Estamos verificando suas permissões para gerenciar usuários.</p>
          </section>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="users-mgmt-root">
        <MenuButtonAdm />
        <div className="users-mgmt-shell">
          <BackButton onClick={() => navigate(-1)} className="btn--ghost back-btn">
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </BackButton>

          <section className="users-mgmt-card users-mgmt-card--warning">
            <h2>Acesso restrito</h2>
            <p>Somente contas com permissões de administrador podem gerenciar perfis de usuário.</p>
            {tokenRoles.length > 0 ? (
              <p>Perfis detectados no token: {tokenRoles.join(", ")}</p>
            ) : null}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="users-mgmt-root">
      <MenuButtonAdm />

      <div className="users-mgmt-shell">
        <BackButton onClick={() => navigate(-1)} className="btn--ghost back-btn">
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </BackButton>

        <section className="users-mgmt-hero">
          <div>
            <p className="users-mgmt-eyebrow">Administração</p>
            <h1>Gerenciamento de Usuários</h1>
            <p>Visualize os perfis cadastrados e atribua ou remova permissão de administrador.</p>
          </div>
          <div className="users-mgmt-stats">
            <article>
              <Users size={18} />
              <strong>{users.length}</strong>
              <span>Perfis</span>
            </article>
            <article>
              <ShieldCheck size={18} />
              <strong>{adminCount}</strong>
              <span>Admins</span>
            </article>
          </div>
        </section>

        <section className="users-mgmt-card">
          {accessDenied ? (
            <div className="users-mgmt-empty" style={{ marginBottom: "0.85rem" }}>
              <ShieldAlert size={20} />
              <span>O backend retornou Access Denied para a listagem de usuários.</span>
            </div>
          ) : null}

          <div className="users-mgmt-toolbar">
            <label className="users-mgmt-search">
              <Search size={17} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, email ou CPF"
              />
            </label>

            <button type="button" className="users-mgmt-refresh" onClick={loadUsers} disabled={loading}>
              {loading ? "Carregando..." : "Atualizar"}
            </button>
          </div>

          <div className="users-mgmt-table-wrap">
            <table className="users-mgmt-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>CPF</th>
                  <th>Perfis</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="users-mgmt-empty">
                        <ShieldAlert size={20} />
                        <span>Nenhum usuário encontrado para o filtro informado.</span>
                      </div>
                    </td>
                  </tr>
                ) : null}

                {filteredUsers.map((user) => {
                  const userId = user?.id ?? user?.userId;
                  const nome = user?.nomeUsuario || user?.name || user?.username || "Sem nome";
                  const email = user?.email || "-";
                  const cpf = user?.cpf || "-";
                  const roles = extractRoles(user);
                  const alreadyAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");
                  const isSelf = currentUserId !== null && Number(userId) === Number(currentUserId);
                  const isSaving = savingId === userId;

                  return (
                    <tr key={userId || `${nome}-${email}`}>
                      <td>{nome}</td>
                      <td>{email}</td>
                      <td>{cpf}</td>
                      <td>
                        <div className="users-mgmt-roles">
                          {roles.length > 0
                            ? roles.map((role) => (
                                <span key={`${userId}-${role}`} className={role.includes("ADMIN") ? "role-chip role-chip--admin" : "role-chip"}>
                                  {role}
                                </span>
                              ))
                            : <span className="role-chip">Sem perfil</span>}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`users-mgmt-promote ${alreadyAdmin ? "users-mgmt-promote--danger" : ""}`}
                          disabled={isSaving || (alreadyAdmin && isSelf)}
                          onClick={() => handleToggleAdmin(user)}
                        >
                          {isSaving
                            ? "Salvando..."
                            : alreadyAdmin
                              ? isSelf
                                ? "Seu admin"
                                : "Remover admin"
                              : "Tornar admin"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
