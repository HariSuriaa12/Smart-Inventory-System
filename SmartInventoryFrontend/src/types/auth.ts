import { Entity } from './common'

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken?: string
  user: User
}

export interface User extends Entity {
  full_Name: string
  username: string
  email: string
  role: UserRole
  mobile_No?: string
  staff_Code?: string
  ic?: string
  creation_Date?: Date
}

export enum UserRole {
  Admin = 1,
  Manager = 2,
  Staff = 3,
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Manager]: 'Manager',
  [UserRole.Staff]: 'Staff',
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export interface CreateUserRequest {
  fullName: string
  username: string
  password: string
  email: string
  role: UserRole
  mobile_No?: string
  staff_Code?: string
  ic?: string
}

export interface UpdateUserRequest {
  fullName?: string
  username?: string
  email?: string
  role?: UserRole
  mobile_No?: string
  staff_Code?: string
  ic?: string
}
