// instancia da variavel de ambiente
import axios from 'axios'
import { authStorage } from './storageAuth'

// Função auxiliar para debugar token
function debugToken(token) {
  if (!token) return
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      console.debug('[Auth] Token claims:', { 
        userId: payload.sub || payload.userId || payload.id,
        email: payload.email,
        roles: payload.roles || payload.authorities
      })
    }
  } catch (e) {
    // silently fail on debug
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    debugToken(token)
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status

    // 401 = token inválido/expirado → desloga
    if (status === 401) {
      authStorage.clear()
    }
    // 403 = sem permissão → NÃO desloga, apenas repassa o erro
    // (o guard de rota já cuida do redirecionamento)

    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Erro de rede'

    // Preserva o status original para handlers conseguirem diferenciar
    const err = new Error(msg)
    err.status = status
    err.data = error?.response?.data
    err.method = error?.config?.method
    err.url = error?.config?.url
    err.requestData = error?.config?.data
    return Promise.reject(err)
  }
)

export { http }
