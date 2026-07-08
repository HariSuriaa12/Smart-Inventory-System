import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { ForecastedResult } from '@/types/forecasting'

export const forecastingService = {
  getForecasts: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<ForecastedResult>>>('/api/forecasting', { params: { skip, take } })).data,

  getForecastById: async (id: number) =>
    (await api.get<ApiResponse<ForecastedResult>>(`/api/forecasting/${id}`)).data,

  getForecastsByItem: async (itemId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<ForecastedResult>>>('/api/forecasting', {
      params: { skip, take, itemId },
    })).data,

  getForecastsByLocation: async (locationId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<ForecastedResult>>>('/api/forecasting', {
      params: { skip, take, locationId },
    })).data,

  triggerForecastGeneration: async () =>
    (await api.post<ApiResponse<any>>('/api/forecasting/generate', {})).data,

  getModelComparison: async (itemId: number, locationId: number) =>
    (await api.get<ApiResponse<any>>('/api/forecasting/comparison', {
      params: { itemId, locationId },
    })).data,
}
