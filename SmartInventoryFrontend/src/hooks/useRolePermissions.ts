import { useState, useEffect } from 'react'
import { rolePermissionService } from '@/services/rolePermissionService'
import { RolePermission } from '@/types/rolePermission'

export const useRolePermissions = (roleId?: number) => {
  const [permissions, setPermissions] = useState<RolePermission | null>(null)
  const [activeRoles, setActiveRoles] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true)
        if (roleId !== undefined) {
          const response = await rolePermissionService.getRolePermissionByRoleId(roleId)
          if (response.success && response.data) {
            setPermissions(response.data)
          }
        }

        const rolesResponse = await rolePermissionService.getActiveRoles()
        if (rolesResponse.success && rolesResponse.data) {
          setActiveRoles(rolesResponse.data)
        }
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch role permissions')
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [roleId])

  const hasPermission = (permission: keyof RolePermission): boolean => {
    if (!permissions) return false
    const value = permissions[permission]
    return typeof value === 'boolean' ? value : false
  }

  return {
    permissions,
    activeRoles,
    loading,
    error,
    hasPermission,
  }
}
