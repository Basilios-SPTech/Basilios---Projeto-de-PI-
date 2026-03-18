import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField.jsx'
import { validateEmail } from '../utils/validators.js'
import { AuthAPI } from '../services/api.js'
import SidebarLogin from '../components/MenuButtonLogin.jsx'
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const emailError = email && !validateEmail(email) ? 'E-mail inválido.' : ''
  const canSubmit = validateEmail(email)

  async function handleForgot(e) {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setServerError('')
    try {
      await AuthAPI.forgot(email)
      toast.success('Se o e-mail existir, enviaremos instruções.')
    } catch (err) {
      setServerError(err.message || 'Falha ao solicitar redefinição.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleForgot} noValidate>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="btn-ghost p-2 hover:bg-gray-100 border border-black rounded-md"
          aria-label="Voltar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-black">Esqueceu a Senha</h1>
      </div>
      <SidebarLogin />

      <p className="text-sm">Informe seu e-mail para receber o link de redefinição de senha.</p>

      <InputField
        id="email"
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@exemplo.com"
        error={emailError}
        showSuccess={email && !emailError}
        autoComplete="email"
      />

      {serverError && <p className="helper-error">{serverError}</p>}

      <button disabled={!canSubmit || submitting} className="btn-primary disabled:opacity-60">
        {submitting ? 'Enviando...' : 'Enviar Link'}
      </button>
    </form>
  )
}