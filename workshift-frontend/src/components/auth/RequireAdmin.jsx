import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth/AuthContext'

export function RequireAdmin({ children }) {
  const { user } = useAuth()

  if (!user?.globalRole || user.globalRole !== 'ADMIN') {
    return <Navigate to="/app/groups" replace />
  }

  return children
}
