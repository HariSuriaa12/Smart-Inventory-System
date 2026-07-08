import { useAppSelector, useAppDispatch } from '@/store/hooks/index'
import { logout } from '@/store/slices/authSlice'
import { User } from '@/types/auth'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, token, loading, error } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  const isAdmin = () => user?.role === 1

  const isManager = () => user?.role === 2

  const isStaff = () => user?.role === 3

  return {
    isAuthenticated,
    user,
    token,
    loading,
    error,
    logout: handleLogout,
    isAdmin,
    isManager,
    isStaff,
  }
}
