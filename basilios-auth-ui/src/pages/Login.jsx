import { useState } from "react";
import InputField from "../components/InputField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { AuthAPI } from "../services/api.js";
import SidebarLogin from "../components/MenuButtonLogin.jsx";
import toast from "react-hot-toast";

import ProgressBar from "../components/loading/ProgressBar.jsx";

export default function Login({ onGoRegister, onGoHome, onGoForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const canSubmit = email && password;

  async function handleLogin(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setServerError("");
    try {
      const data = await AuthAPI.login(email, password);
      toast.success("Bem-vindo!");

      // Se havia redirect pendente (ex: veio do carrinho), vai pra lá
      const redirect = sessionStorage.getItem("redirectAfterLogin");
      if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
        return;
      }

      // navegação via prop (App controla o destino)
      if (typeof onGoHome === "function") onGoHome();
    } catch (err) {
      setServerError(err.message || "Falha no login.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleLogin} noValidate>
      <h1 className="text-3xl font-bold text-black">Login</h1>
      <SidebarLogin />

      <InputField
        id="email"
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@exemplo.com"
        autoComplete="email"
      />

      <PasswordField
        id="password"
        label="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
        autoComplete="current-password"
      />

      {serverError && <p className="helper-error">{serverError}</p>}

      <div className="flex items-center justify-between pt-2">
        <button
          disabled={!canSubmit || submitting}
          className="btn-primary disabled:opacity-60 shrink-0"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          className="btn-ghost shrink-0"
          onClick={() => onGoForgot?.(email)}
        >
          Esqueceu a senha?
        </button>
      </div>

      <div className="text-sm pt-4">
        Não tem conta?{" "}
        <button
          type="button"
          onClick={onGoRegister}
          className="text-brand underline decoration-1 underline-offset-4"
        >
          Cadastre-se
        </button>
        <ProgressBar visible={submitting} message="Carregando..." />
      </div>
    </form>
  );
}
