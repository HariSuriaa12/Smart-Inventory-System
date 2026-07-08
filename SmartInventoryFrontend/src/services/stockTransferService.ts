import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { StockTransfer, CreateStockTransferRequest, UpdateStockTransferRequest } from '@/types/stocktransfer'

export const stockTransferService = {
  getTransfers: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<StockTransfer>>>('/api/stocktransfer', { params: { skip, take } })).data,

  getTransferById: async (id: number) =>
    (await api.get<ApiResponse<StockTransfer>>(`/api/stocktransfer/${id}`)).data,

  createTransfer: async (data: CreateStockTransferRequest) =>
    (await api.post<ApiResponse<StockTransfer>>('/api/stocktransfer', data)).data,

  updateTransfer: async (id: number, data: UpdateStockTransferRequest) =>
    (await api.put<ApiResponse<StockTransfer>>(`/api/stocktransfer/${id}`, data)).data,

  deleteTransfer: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/stocktransfer/${id}`)).data,

  getTransfersByLocation: async (locationId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<StockTransfer>>>('/api/stocktransfer', {
      params: { skip, take, locationId },
    })).data,
}
