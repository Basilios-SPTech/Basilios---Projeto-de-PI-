// instancia da variavel de ambiente
import axios from 'axios'
import { authStorage } from './storageAuth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
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
    return Promise.reject(err)
  }
)

export { http }
