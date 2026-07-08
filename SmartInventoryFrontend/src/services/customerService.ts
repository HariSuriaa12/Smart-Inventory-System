import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer'

export const customerService = {
  getCustomers: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Customer>>>('/api/customers', { params: { skip, take } })).data,

  getCustomerById: async (id: number) =>
    (await api.get<ApiResponse<Customer>>(`/api/customers/${id}`)).data,

  createCustomer: async (data: CreateCustomerRequest) =>
    (await api.post<ApiResponse<Customer>>('/api/customers', data)).data,

  updateCustomer: async (id: number, data: UpdateCustomerRequest) =>
    (await api.put<ApiResponse<Customer>>(`/api/customers/${id}`, data)).data,

  deleteCustomer: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/customers/${id}`)).data,
}
