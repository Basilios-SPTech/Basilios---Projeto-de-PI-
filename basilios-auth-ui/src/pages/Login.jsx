import { useState } from 'react'
import InputField from '../components/InputField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import { validateEmail, validatePassword } from '../utils/validators.js'
import { AuthAPI } from '../services/api.js'
import SidebarUser from '../components/MenuButton.jsx'

export default function Login({ onGoRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('') // <- estado separado
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const emailError = email && !validateEmail(email) ? 'E-mail inválido.' : ''
  const passError =
    password && !validatePassword(password)
      ? 'Senha deve ter 8+ caracteres e conter letras e números.'
      : ''
  const canSubmit = validateEmail(email) && validatePassword(password)

  async function handleLogin(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setServerError('')
    try {
      const data = await AuthAPI.login(email, password)
      console.log('login ok:', data)
      alert('Login efetuado.')
    } catch (err) {
      setServerError(err.message || 'Falha no login.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    // usa o forgotEmail (não o email do login)
    if (!validateEmail(forgotEmail)) return
    setSubmitting(true)
    setServerError('')
    try {
      await AuthAPI.forgot(forgotEmail)
      alert('Se o e-mail existir, enviaremos instruções.')
    } catch (err) {
      setServerError(err.message || 'Falha ao solicitar redefinição.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleLogin} noValidate>
      <h1 className="text-3xl font-bold text-black">Login</h1>
      <SidebarUser />
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

      <PasswordField
        id="password"
        label="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
        error={passError}
        showSuccess={password && !passError}
        autoComplete="current-password"
      />

      {serverError && <p className="helper-error">{serverError}</p>}

      <div className="flex items-center justify-between gap-3">
        <button disabled={!canSubmit || submitting} className="btn-primary disabled:opacity-60">
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            // abre/fecha o bloco e faz prefill UMA vez
            setForgotOpen((prev) => {
              const next = !prev
              if (next && email && !forgotEmail) setForgotEmail(email)
              return next
            })
          }}
        >
          Esqueceu a senha?
        </button>
      </div>

      {forgotOpen && (
        <div className="rounded-lg bg-gray-light p-4">
          <p className="text-sm mb-2">Informe seu e-mail para receber o link.</p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              className="input input-focus flex-1"
              placeholder="voce@exemplo.com"
              value={forgotEmail}                          
              onChange={(e) => setForgotEmail(e.target.value)}  
            />
            <button
              onClick={handleForgot}
              disabled={!validateEmail(forgotEmail) || submitting}
              className="btn-primary"
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      <div className="text-sm">
        Não tem conta?{' '}
        <button type="button" onClick={onGoRegister} className="text-brand underline decoration-1 underline-offset-4">
          Cadastre-se
        </button>
      </div>
    </form>
  )
}
