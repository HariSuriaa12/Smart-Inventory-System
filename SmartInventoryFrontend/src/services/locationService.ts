import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { Location, CreateLocationRequest, UpdateLocationRequest } from '@/types/location'

export const locationService = {
  getLocations: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Location>>>('/api/locations', { params: { skip, take } })).data,

  getLocationById: async (id: number) =>
    (await api.get<ApiResponse<Location>>(`/api/locations/${id}`)).data,

  createLocation: async (data: CreateLocationRequest) =>
    (await api.post<ApiResponse<Location>>('/api/locations', data)).data,

  updateLocation: async (id: number, data: UpdateLocationRequest) =>
    (await api.put<ApiResponse<Location>>(`/api/locations/${id}`, data)).data,

  deleteLocation: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/locations/${id}`)).data,
}
