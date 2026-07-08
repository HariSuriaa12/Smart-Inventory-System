import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { Inventory, AdjustInventoryRequest } from '@/types/inventory'

export const inventoryService = {
  getInventory: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Inventory>>>('/api/inventory', { params: { skip, take } })).data,

  getInventoryById: async (id: number) =>
    (await api.get<ApiResponse<Inventory>>(`/api/inventory/${id}`)).data,

  getInventoryByLocation: async (locationId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Inventory>>>(`/api/inventory/location/${locationId}`, {
      params: { skip, take },
    })).data,

  adjustInventory: async (id: number, data: AdjustInventoryRequest) =>
    (await api.post<ApiResponse<Inventory>>(`/api/inventory/${id}/adjust`, data)).data,
}
