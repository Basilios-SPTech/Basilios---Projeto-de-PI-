export function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).toLowerCase())
}

export function validatePassword(v) {
  if (!v || v.length < 8) return false
  const hasLetter = /[A-Za-z]/.test(v)
  const hasNumber = /\d/.test(v)
  return hasLetter && hasNumber
}

export function validateCPF(cpf) {
  if (!cpf) return false
  const digits = String(cpf).replace(/\D/g, '')
  if (digits.length !== 11 || /^([0-9])\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i)
  let rev = 11 - (sum % 11)
  rev = rev === 10 || rev === 11 ? 0 : rev
  if (rev !== parseInt(digits.charAt(9))) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i)
  rev = 11 - (sum % 11)
  rev = rev === 10 || rev === 11 ? 0 : rev
  return rev === parseInt(digits.charAt(10))
}

export function validatePhone(phone) {
  const digits = String(phone).replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 11
}

export function maskCPF(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11)
  return d.replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return d
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function isNonEmpty(v) {
  return String(v || '').trim().length > 0
}
