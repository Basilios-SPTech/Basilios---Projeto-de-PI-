import { useState } from 'react'
import InputField from '../components/InputField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import {
  validateEmail,
  validatePassword,
  validateCPF,
  validatePhone,
  maskCPF,
  maskPhone,
  isNonEmpty,
} from '../utils/validators.js'
import { AuthAPI } from '../services/api.js'

export default function Register({ onGoLogin }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirm: '',
    cpf: '',
    phone: '',
    birth: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  const errors = {
    fullName: form.fullName && !isNonEmpty(form.fullName) ? 'Informe seu nome completo.' : '',
    email: form.email && !validateEmail(form.email) ? 'E-mail inválido.' : '',
    password: form.password && !validatePassword(form.password) ? 'Senha deve ter 8+ caracteres e conter letras e números.' : '',
    confirm: form.confirm && form.confirm !== form.password ? 'As senhas não coincidem.' : '',
    cpf: form.cpf && !validateCPF(form.cpf) ? 'CPF inválido.' : '',
    phone: form.phone && !validatePhone(form.phone) ? 'Telefone inválido.' : '',
    birth: '', // opcional; valide formato se desejar
  }

  const canSubmit =
    isNonEmpty(form.fullName) &&
    validateEmail(form.email) &&
    validatePassword(form.password) &&
    form.confirm === form.password &&
    validateCPF(form.cpf) &&
    validatePhone(form.phone)

  async function handleRegister(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setServerError('')
    try {
      const payload = {
        nomeUsuario: form.fullName,
        email: form.email,
        password: form.password,
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, ''),
        birthDate: form.birth || null,
      }
      const data = await AuthAPI.register(payload)
      console.log('register ok:', data)
      alert('Cadastro efetuado. Troque este alert por navegação/feedback real.')
      onGoLogin()
    } catch (err) {
      setServerError(err.message || 'Falha no cadastro.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleRegister} noValidate>
      <h1 className="text-3xl font-bold text-black">Cadastro</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="fullName"
          label="Nome completo"
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          placeholder="Seu nome completo"
          error={errors.fullName}
          showSuccess={form.fullName && !errors.fullName}
          autoComplete="name"
        />

        <InputField
          id="email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="voce@exemplo.com"
          error={errors.email}
          showSuccess={form.email && !errors.email}
          autoComplete="email"
        />

        <PasswordField
          id="password"
          label="Senha"
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          placeholder="********"
          error={errors.password}
          showSuccess={form.password && !errors.password}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm"
          label="Confirmar senha"
          value={form.confirm}
          onChange={(e) => setField('confirm', e.target.value)}
          placeholder="********"
          error={errors.confirm}
          showSuccess={form.confirm && !errors.confirm}
          autoComplete="new-password"
        />

        <InputField
          id="cpf"
          label="CPF"
          value={form.cpf}
          onChange={(e) => setField('cpf', maskCPF(e.target.value))}
          placeholder="000.000.000-00"
          error={errors.cpf}
          showSuccess={form.cpf && !errors.cpf}
          autoComplete="off"
          maxLength={14}
        />

        <InputField
          id="phone"
          label="Telefone"
          value={form.phone}
          onChange={(e) => setField('phone', maskPhone(e.target.value))}
          placeholder="(11) 99999-9999"
          error={errors.phone}
          showSuccess={form.phone && !errors.phone}
          autoComplete="tel"
          maxLength={16}
        />

        <div className="md:col-span-2">
          <InputField
            id="birth"
            label="Data de nascimento (opcional)"
            type="date"
            value={form.birth}
            onChange={(e) => setField('birth', e.target.value)}
            placeholder=""
            error={errors.birth}
            showSuccess={false}
            autoComplete="bday"
          />
        </div>
      </div>

      {serverError && <p className="helper-error">{serverError}</p>}

      <div className="flex items-center justify-between gap-3">
        <button disabled={!canSubmit || submitting} className="btn-primary disabled:opacity-60">
          {submitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        <button type="button" className="btn-ghost" onClick={onGoLogin}>
          Já tem conta? Entre
        </button>
      </div>
    </form>
  )
}
