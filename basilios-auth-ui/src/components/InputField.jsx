/** inputs com validações de login/cadastro*/

export default function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  showSuccess,
  autoComplete,
  maxLength,
}) {
  const base = 'input input-focus'
  const state = error ? 'input-error' : (showSuccess ? 'input-success' : 'border-gray-300')
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-black/90">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${base} ${state}`}
        autoComplete={autoComplete}
        maxLength={maxLength}
      />
      {error ? (
        <p className="helper-error">{error}</p>
      ) : showSuccess ? (
        <p className="helper-success">Tudo certo ✔</p>
      ) : null}
    </div>
  )
}
