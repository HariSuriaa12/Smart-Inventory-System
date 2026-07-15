import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { StockTransfer, CreateStockTransferRequest, UpdateStockTransferRequest, StockTransferStatus } from '@/types/stocktransfer'

interface GetTransfersParams {
  skip?: number
  take?: number
  id?: number
  status?: StockTransferStatus
  transferType?: 'shipped' | 'received'
  fromLocationId?: number
  toLocationId?: number
  itemId?: number
  dateFrom?: string
  dateTo?: string
}

export const stockTransferService = {
  getTransfers: async (params: GetTransfersParams | number = {}, take: number = 10) => {
    let queryParams: any = {}

    if (typeof params === 'number') {
      queryParams = { skip: params, take }
    } else {
      queryParams = {
        skip: params.skip || 0,
        take: params.take || 10,
      }
      if (params.id !== undefined) queryParams.id = params.id
      if (params.status !== undefined) queryParams.status = params.status
      if (params.transferType) queryParams.transferType = params.transferType
      if (params.fromLocationId) queryParams.fromLocationId = params.fromLocationId
      if (params.toLocationId) queryParams.toLocationId = params.toLocationId
      if (params.itemId) queryParams.itemId = params.itemId
      if (params.dateFrom) queryParams.dateFrom = params.dateFrom
      if (params.dateTo) queryParams.dateTo = params.dateTo
    }

    return (await api.get<ApiResponse<PaginatedResponse<StockTransfer>>>('/api/stocktransfer', { params: queryParams })).data
  },

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
