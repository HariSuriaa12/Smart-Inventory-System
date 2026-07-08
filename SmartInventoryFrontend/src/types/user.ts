import { Entity } from './common'
import { User, UserRole, UpdateUserRequest, CreateUserRequest } from './auth'

export interface UserState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}

export { User, UserRole, UpdateUserRequest, CreateUserRequest }
