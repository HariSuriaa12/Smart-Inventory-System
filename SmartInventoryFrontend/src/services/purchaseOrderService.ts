import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, ReceivePurchaseOrderItemRequest } from '@/types/purchaseorder'

export const purchaseOrderService = {
  getPurchaseOrders: async (skip: number = 0, take: number = 10, filters?: any) =>
    (await api.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>('/api/purchaseorders', { params: { skip, take, ...filters } })).data,

  getPurchaseOrderById: async (id: number) =>
    (await api.get<ApiResponse<PurchaseOrder>>(`/api/purchaseorders/${id}`)).data,

  createPurchaseOrder: async (data: CreatePurchaseOrderRequest) =>
    (await api.post<ApiResponse<PurchaseOrder>>('/api/purchaseorders', data)).data,

  updatePurchaseOrder: async (id: number, data: UpdatePurchaseOrderRequest) =>
    (await api.put<ApiResponse<PurchaseOrder>>(`/api/purchaseorders/${id}`, data)).data,

  deletePurchaseOrder: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/purchaseorders/${id}`)).data,

  receivePurchaseOrderItem: async (id: number, data: ReceivePurchaseOrderItemRequest) =>
    (await api.post<ApiResponse<PurchaseOrder>>(`/api/purchaseorders/${id}/receive`, data)).data,

  addItemToPO: async (id: number, itemData: { itemId: number; orderQuantity: number; unitPrice: number }) =>
    (await api.post<ApiResponse<PurchaseOrder>>(`/api/purchaseorders/${id}/items`, itemData)).data,

  removeItemFromPO: async (id: number, itemId: number) =>
    (await api.delete<ApiResponse<PurchaseOrder>>(`/api/purchaseorders/${id}/items/${itemId}`)).data,

  getPurchaseOrdersByVendor: async (vendorId: number, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>('/api/purchaseorders', {
      params: { skip, take, vendorId },
    })).data,
}
