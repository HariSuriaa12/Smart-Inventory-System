import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { Vendor, CreateVendorRequest, UpdateVendorRequest } from '@/types/vendor'

export const vendorService = {
  getVendors: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Vendor>>>('/api/vendors', { params: { skip, take } })).data,

  getVendorById: async (id: number) =>
    (await api.get<ApiResponse<Vendor>>(`/api/vendors/${id}`)).data,

  createVendor: async (data: CreateVendorRequest) =>
    (await api.post<ApiResponse<Vendor>>('/api/vendors', data)).data,

  updateVendor: async (id: number, data: UpdateVendorRequest) =>
    (await api.put<ApiResponse<Vendor>>(`/api/vendors/${id}`, data)).data,

  deleteVendor: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/vendors/${id}`)).data,
}
