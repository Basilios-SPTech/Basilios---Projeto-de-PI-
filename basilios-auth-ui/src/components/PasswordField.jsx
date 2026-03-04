/* Esse componente trata da visibilidade da senha on/off */
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import InputField from './InputField.jsx'

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <InputField {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-[50px] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  )
}
