import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import InputField from "../InputField.jsx";
import { validateEmail } from "../../utils/validators.js";
import { AuthAPI } from "../../services/api.js";
import Modal from "../Modal.jsx";

const RESEND_COOLDOWN_SECONDS = 45;

export default function ForgotPasswordForm({ initialEmail = "", onGoLogin }) {
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showSentModal, setShowSentModal] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    setEmail(initialEmail || "");
  }, [initialEmail]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const emailError = email && !validateEmail(email) ? "E-mail inválido." : "";
  const isCooldownActive = cooldownSeconds > 0;
  const canSubmit = validateEmail(email) && !submitting && !isCooldownActive;
  const canResend = validateEmail(email) && !resending && cooldownSeconds === 0;

  function openSuccessModal() {
    setShowSentModal(true);
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isCooldownActive) {
      setShowSentModal(true);
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    setServerError("");

    try {
      await AuthAPI.forgotPassword(email);
      openSuccessModal();
    } catch (err) {
      if (err?.status === 429) {
        setServerError("Muitas tentativas, tente novamente mais tarde.");
      } else if (err?.status === 400) {
        setServerError(err?.message || "Verifique os campos e tente novamente.");
      } else {
        setServerError("Não foi possível enviar no momento. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;

    setResending(true);
    setServerError("");

    try {
      await AuthAPI.forgotPassword(email);
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err?.status === 429) {
        setServerError("Muitas tentativas, tente novamente mais tarde.");
      } else if (err?.status === 400) {
        setServerError(err?.message || "Verifique os campos e tente novamente.");
      } else {
        setServerError("Não foi possível reenviar agora. Tente novamente.");
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <h1 className="text-3xl font-bold text-black">Recuperar senha</h1>
        <p className="text-sm text-gray-600">
          Informe seu e-mail para receber o link de redefinição.
        </p>

        <InputField
          id="forgot-email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          error={emailError}
          showSuccess={email && !emailError}
          autoComplete="email"
        />

        <p className="-mt-2 text-xs text-gray-500">
          Confira com atenção o e-mail digitado para garantir o recebimento.
        </p>

        {serverError && <p className="helper-error">{serverError}</p>}

        <div className="flex items-center justify-between pt-2">
          <button disabled={!canSubmit} className="btn-primary disabled:opacity-60">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Enviando link...
              </span>
            ) : isCooldownActive ? (
              `Aguarde ${cooldownSeconds}s para enviar novamente`
            ) : (
              "Enviar link"
            )}
          </button>

          <button type="button" className="btn-ghost" onClick={onGoLogin}>
            Voltar para login
          </button>
        </div>
      </form>

      <Modal isOpen={showSentModal} onClose={() => setShowSentModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Link enviado</h2>

          <p className="text-sm text-gray-700 leading-6">
            Se o e-mail estiver cadastrado, um link de redefinição foi enviado para{" "}
            <strong>{email}</strong>.
          </p>

          <p className="text-xs text-gray-500">
            Verifique caixa de entrada, spam e promoções antes de tentar novamente.
          </p>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button type="button" className="btn-ghost" onClick={() => setShowSentModal(false)}>
              Fechar
            </button>

            <button
              type="button"
              disabled={!canResend}
              onClick={handleResend}
              className="btn-primary disabled:opacity-60"
            >
              {resending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Reenviando...
                </span>
              ) : cooldownSeconds > 0 ? (
                `Não recebeu? Reenviar (${cooldownSeconds}s)`
              ) : (
                "Não recebeu? Reenviar"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
