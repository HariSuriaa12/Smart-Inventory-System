import { useAppSelector, useAppDispatch } from '@/store/hooks/index'
import { logout } from '@/store/slices/authSlice'
import { User } from '@/types/auth'
import { useMemo } from 'react'

export const useAuth = () => {
  const dispatch = useAppDispatch()

  // Memoized selectors to prevent unnecessary re-renders
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)
  const token = useAppSelector((state) => state.auth.token)
  const loading = useAppSelector((state) => state.auth.loading)
  const error = useAppSelector((state) => state.auth.error)

  const handleLogout = () => {
    dispatch(logout())
  }

  const isAdmin = useMemo(() => () => user?.role === 1, [user])
  const isManager = useMemo(() => () => user?.role === 2, [user])
  const isStaff = useMemo(() => () => user?.role === 3, [user])

  return useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      loading,
      error,
      logout: handleLogout,
      isAdmin,
      isManager,
      isStaff,
    }),
    [isAuthenticated, user, token, loading, error]
  )
}
