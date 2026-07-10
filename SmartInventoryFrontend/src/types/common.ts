export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  statusCode: number
  errors?: string[]
}

export interface PaginationRequest {
  skip: number
  take: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  skip: number
  take: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

export interface Entity {
  ID: number
  Creation_Date?: string | Date
  Is_Deleted?: boolean
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ListState<T> extends LoadingState {
  items: T[]
  total: number
  skip: number
  take: number
}

export interface DetailState<T> extends LoadingState {
  data: T | null
}

export enum OperationType {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export interface FilterOptions {
  skip: number
  take: number
  searchQuery?: string
  [key: string]: any
}
