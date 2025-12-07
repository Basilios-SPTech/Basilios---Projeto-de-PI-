import { http } from './http'
import { authStorage } from './storageAuth'

export const AuthAPI = {
  async login(email, password) {
    const { data } = await http.post('api/auth/login', { email, password })
    if (data?.token) authStorage.setToken(data.token)
    return data
  },

  async register(payload) { 
    const { data } = await http.post('api/auth/register', payload)
    if (data?.token) authStorage.setToken(data.token)
    return data
  },


  logout() {
    authStorage.clear()
  },
}
