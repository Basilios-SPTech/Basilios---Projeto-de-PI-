import { http } from './http'
import { authStorage } from './storageAuth'

export const AuthAPI = {
  async login(email, password) {
    const { data } = await http.post('/auth/login', { email, password })
    if (data?.token) authStorage.setToken(data.token)
    return data
  },

  async register(payload) { 
    const { data } = await http.post('/auth/register', payload)
    if (data?.token) authStorage.setToken(data.token)
    return data
  },

  async forgotPassword(email) {
    try {
      await http.post('/auth/esqueci-senha', { email })
      return { ok: true }
    } catch (err) {
      if (err?.status === 400 || err?.status === 429) {
        throw err
      }
      return { ok: true }
    }
  },

  async resetPassword(codigo, novaSenha) {
    const { data } = await http.post('/auth/reset-senha', { codigo, novaSenha })
    return data
  },

  async forgot(email) {
    return this.forgotPassword(email)
  },


  logout() {
    authStorage.clear()
  },
}
