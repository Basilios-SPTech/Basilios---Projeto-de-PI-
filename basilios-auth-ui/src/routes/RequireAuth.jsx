// src/routes/RequireAuth.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { authStorage } from '../services/storageAuth'

export default function RequireAuth({ roles }) {
  // 1) precisa estar logado
  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  // 2) precisa ter as roles (se pedidas)
  if (roles && roles.length > 0 && !authStorage.hasRole(...roles)) {
    return <Navigate to="/home" replace />
  }
  return <Outlet />
}
