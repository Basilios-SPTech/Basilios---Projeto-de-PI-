export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data?.message || 'Falha na solicitação.'
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

export const AuthAPI = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload }),

  forgot: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),
}
