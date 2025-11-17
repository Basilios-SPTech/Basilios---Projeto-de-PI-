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
    if (status === 401 || status === 403) {
      authStorage.clear() 
    }
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Erro de rede'
    return Promise.reject(new Error(msg))
  }
)

export { http }
