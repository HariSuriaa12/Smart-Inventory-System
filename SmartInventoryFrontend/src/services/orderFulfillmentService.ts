import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { OrderFulfillment, ReceiveOrderFulfillmentRequest } from '@/types/orderfulfillment'

export const orderFulfillmentService = {
  getOrders: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<OrderFulfillment>>>('/api/orderfulfillment', { params: { skip, take } })).data,

  getOrderById: async (id: number) =>
    (await api.get<ApiResponse<OrderFulfillment>>(`/api/orderfulfillment/${id}`)).data,

  receiveOrder: async (id: number, data: ReceiveOrderFulfillmentRequest[]) =>
    (await api.post<ApiResponse<OrderFulfillment>>(`/api/orderfulfillment/${id}/receive`, data)).data,

  getOrdersByCustomer: async (customerId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<OrderFulfillment>>>('/api/orderfulfillment', {
      params: { skip, take, customerId },
    })).data,

  getOrdersByLocation: async (locationId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<OrderFulfillment>>>('/api/orderfulfillment', {
      params: { skip, take, locationId },
    })).data,
}
