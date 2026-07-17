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
  userID: number
  role_Name : string
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
  Admin = 0,
  Manager = 1,
  Staff = 2,
  IT = 3,
  Other = 4
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.Admin]: 'Super Admin',
  [UserRole.Manager]: 'Manager',
  [UserRole.Staff]: 'Staff',
  [UserRole.IT]: 'IT',
  [UserRole.Other]: 'Other',
}

export interface AuthState {
  isAuthenticated: boolean
  currentUser: User | null
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export interface CreateUserRequest {
  full_Name: string
  username: string
  password: string
  email: string
  role: UserRole
  mobile_No?: string
  staff_Code?: string
  ic?: string
}

export interface UpdateUserRequest {
  full_Name?: string
  username?: string
  email?: string
  role?: UserRole
  mobile_No?: string
  staff_Code?: string
  ic?: string
}
