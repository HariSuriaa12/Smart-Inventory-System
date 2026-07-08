import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { Sales, ReceiveSalesRequest } from '@/types/sales'

export const salesService = {
  getSales: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Sales>>>('/api/sales', { params: { skip, take } })).data,

  getSaleById: async (id: number) =>
    (await api.get<ApiResponse<Sales>>(`/api/sales/${id}`)).data,

  receiveSalesData: async (data: ReceiveSalesRequest) =>
    (await api.post<ApiResponse<any>>('/api/sales/import', data)).data,

  getSalesByLocation: async (locationId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Sales>>>('/api/sales', {
      params: { skip, take, locationId },
    })).data,

  getSalesAnalytics: async (locationId?: number, dateFrom?: string, dateTo?: string) =>
    (await api.get<ApiResponse<any>>('/api/sales/analytics', {
      params: { locationId, dateFrom, dateTo },
    })).data,
}
