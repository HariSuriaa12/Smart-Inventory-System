import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { Item, CreateItemRequest, UpdateItemRequest } from '@/types/item'

export const itemService = {
  getItems: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Item>>>('/api/items', { params: { skip, take } })).data,

  getItemById: async (id: number) =>
    (await api.get<ApiResponse<Item>>(`/api/items/${id}`)).data,

  createItem: async (data: CreateItemRequest) =>
    (await api.post<ApiResponse<Item>>('/api/items', data)).data,

  updateItem: async (id: number, data: UpdateItemRequest) =>
    (await api.put<ApiResponse<Item>>(`/api/items/${id}`, data)).data,

  deleteItem: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/items/${id}`)).data,

  getByCategory: async (category: string, skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Item>>>(`/api/items/category/${category}`, { params: { skip, take } })).data,
}
