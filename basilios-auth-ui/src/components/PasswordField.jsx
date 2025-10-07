/* Esse componente trata da visibilidade da senha on/off */
import { useState } from 'react'
import InputField from './InputField.jsx'

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <InputField {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-2 top-7 text-xs text-brand hover:underline"
        aria-label="Alternar visibilidade da senha"
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
