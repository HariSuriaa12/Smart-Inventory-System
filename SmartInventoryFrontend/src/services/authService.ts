import { api } from './api'
import { ApiResponse } from '@/types/common'
import { LoginRequest, AuthResponse, User, CreateUserRequest, UpdateUserRequest } from '@/types/auth'

export const authService = {
  login: async (credentials: LoginRequest) =>
    (await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials)).data,

  getProfile: async () =>
    (await api.get<ApiResponse<User>>('/api/users/profile')).data,

  logout: async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  saveToken: (token: string) => {
    localStorage.setItem('token', token)
  },

  getToken: () => localStorage.getItem('token'),

  saveUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  getUser: () => {
    const user = localStorage.getItem('user')
    return user && user !== "undefined" ? JSON.parse(user) : null
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  // User CRUD operations
  getUsers: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<any>>('/api/users', { params: { skip, take } })).data,

  getUserById: async (id: number) =>
    (await api.get<ApiResponse<User>>(`/api/users/${id}`)).data,

  createUser: async (data: CreateUserRequest) =>
    (await api.post<ApiResponse<User>>('/api/users', data)).data,

  updateUser: async (id: number, data: UpdateUserRequest) =>
    (await api.put<ApiResponse<User>>(`/api/users/${id}`, data)).data,

  deleteUser: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/users/${id}`)).data,
}
