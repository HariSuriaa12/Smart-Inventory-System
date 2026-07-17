import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { RolePermission, CreateRolePermissionRequest, UpdateRolePermissionRequest, RoleDropdown } from '@/types/rolePermission'

export const rolePermissionService = {
  getRolePermissions: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<RolePermission>>>('/api/RolePermissions', { params: { skip, take } })).data,

  getActiveRoles: async () =>
    (await api.get<ApiResponse<RolePermission[]>>('/api/RolePermissions/active')).data,

  getRolePermissionById: async (id: number) =>
    (await api.get<ApiResponse<RolePermission>>(`/api/RolePermissions/${id}`)).data,

  getRolePermissionByRoleId: async (roleId: number) =>
    (await api.get<ApiResponse<RolePermission>>(`/api/RolePermissions/role/${roleId}`)).data,

  createRolePermission: async (data: CreateRolePermissionRequest) =>
    (await api.post<ApiResponse<RolePermission>>('/api/RolePermissions', data)).data,

  updateRolePermission: async (id: number, data: UpdateRolePermissionRequest) =>
    (await api.put<ApiResponse<RolePermission>>(`/api/RolePermissions/${id}`, data)).data,

  deleteRolePermission: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/RolePermissions/${id}`)).data,

  canDeleteRole: async (roleId: number) =>
    (await api.get<ApiResponse<boolean>>(`/api/RolePermissions/${roleId}/can-delete`)).data,
}
