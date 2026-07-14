import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { OrderFulfillment, ReceiveOrderFulfillmentRequest } from '@/types/orderfulfillment'

export const orderFulfillmentService = {
  getAllOrderFulfillments: async (skip: number = 0, take: number = 10, filters?: any) =>
    (await api.get<ApiResponse<PaginatedResponse<OrderFulfillment>>>('/api/orderfulfillment', { params: { skip, take, ...filters } })).data,

  getOrderFulfillmentById: async (id: number) =>
    (await api.get<ApiResponse<OrderFulfillment>>(`/api/orderfulfillment/${id}`)).data,

  verifyAndAssign: async (id: number, locationId: number) =>
    (await api.post<ApiResponse<OrderFulfillment>>(`/api/orderfulfillment/${id}/verify-and-assign`, null, { params: { locationId } })).data,

  shipItem: async (id: number, itemId: number, shippedQuantity: number) =>
    (await api.post<ApiResponse<OrderFulfillment>>(`/api/orderfulfillment/${id}/items/${itemId}/ship`, null, { params: { shippedQuantity } })).data,

  cancelItem: async (id: number, itemId: number) =>
    (await api.post<ApiResponse<OrderFulfillment>>(`/api/orderfulfillment/${id}/items/${itemId}/cancel`)).data,

  cancelItemWithReturn: async (id: number, itemId: number) =>
    (await api.post<ApiResponse<OrderFulfillment>>(`/api/orderfulfillment/${id}/items/${itemId}/cancel-with-return`)).data,

  deleteOrderFulfillment: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/orderfulfillment/${id}`)).data,

  getByCustomer: async (customerId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<OrderFulfillment>>>(`/api/orderfulfillment/customer/${customerId}`, {
      params: { skip, take },
    })).data,
}
