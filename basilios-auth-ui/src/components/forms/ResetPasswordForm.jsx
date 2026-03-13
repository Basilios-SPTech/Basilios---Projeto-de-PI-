import { useMemo, useState } from "react";
import PasswordField from "../PasswordField.jsx";
import { validatePassword } from "../../utils/validators.js";
import { AuthAPI } from "../../services/api.js";
import toast from "react-hot-toast";

function getStrengthLabel(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "Fraca";
  if (score <= 3) return "Média";
  return "Forte";
}

export default function ResetPasswordForm({ token, onGoLogin }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const tokenMissing = !token;
  const passwordError =
    novaSenha && !validatePassword(novaSenha)
      ? "Senha deve ter 8+ caracteres e conter letras e números."
      : "";
  const confirmError =
    confirmarSenha && confirmarSenha !== novaSenha
      ? "As senhas não coincidem."
      : "";

  const strength = useMemo(() => getStrengthLabel(novaSenha), [novaSenha]);
  const canSubmit =
    !tokenMissing && validatePassword(novaSenha) && confirmarSenha === novaSenha && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setServerError("");

    try {
      await AuthAPI.resetPassword(token, novaSenha);
      toast.success("Senha redefinida com sucesso. Faça login novamente.");
      onGoLogin();
    } catch (err) {
      if (err?.status === 429) {
        setServerError("Muitas tentativas, tente novamente mais tarde.");
      } else if (err?.status === 400) {
        setServerError(
          err?.message ||
            "Token inválido ou expirado. Solicite um novo link de redefinição."
        );
      } else {
        setServerError("Não foi possível redefinir a senha agora. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <h1 className="text-3xl font-bold text-black">Redefinir senha</h1>
      <p className="text-sm text-gray-600">
        Defina uma nova senha para sua conta.
      </p>

      {tokenMissing && (
        <p className="helper-error">
          Link inválido: token ausente. Solicite um novo link de redefinição.
        </p>
      )}

      <PasswordField
        id="new-password"
        label="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        placeholder="********"
        error={passwordError}
        showSuccess={novaSenha && !passwordError}
        autoComplete="new-password"
      />

      {novaSenha && !passwordError && (
        <p className="text-xs text-gray-600">Força da senha: {strength}</p>
      )}

      <PasswordField
        id="confirm-password"
        label="Confirmar nova senha"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
        placeholder="********"
        error={confirmError}
        showSuccess={confirmarSenha && !confirmError}
        autoComplete="new-password"
      />

      {serverError && <p className="helper-error">{serverError}</p>}

      <div className="flex items-center justify-between pt-2">
        <button disabled={!canSubmit} className="btn-primary disabled:opacity-60">
          {submitting ? "Redefinindo..." : "Redefinir senha"}
        </button>

        <button type="button" className="btn-ghost" onClick={onGoLogin}>
          Ir para login
        </button>
      </div>
    </form>
  );
}
