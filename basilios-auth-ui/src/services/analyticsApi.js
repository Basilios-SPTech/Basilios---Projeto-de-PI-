// src/services/analyticsApi.js
import { http } from './http'

export const analyticsApi = {
  async getMenu(signal) {
    const { data } = await http.get('/api/menu', { signal })
    return Array.isArray(data) ? data : []
  },
}
