import { api } from './api'
import { ApiResponse } from '@/types/common'
import { Inventory, AdjustInventoryRequest, StockTransferRequest } from '@/types/inventory'

export const inventoryService = {
  getInventoryByLocation: async (locationId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<Inventory[]>>(`/api/inventory/location/${locationId}`, {
      params: { skip, take },
    })).data,

  getInventoryByItem: async (itemId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<Inventory[]>>(`/api/inventory/item/${itemId}`, {
      params: { skip, take },
    })).data,

  getInventoryById: async (id: number) =>
    (await api.get<ApiResponse<Inventory>>(`/api/inventory/${id}`)).data,

  adjustInventory: async (data: AdjustInventoryRequest) =>
    (await api.put<ApiResponse<Inventory>>('/api/inventory/adjust', data)).data,

  transferStock: async (data: StockTransferRequest) =>
    (await api.post<ApiResponse<Inventory>>('/api/inventory/transfer', data)).data,
}
