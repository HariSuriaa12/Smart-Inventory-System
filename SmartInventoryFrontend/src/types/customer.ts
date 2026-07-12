import { Entity } from './common'

export interface Customer extends Entity {
  company_Name: string
  customer_Code: string
  address: string
  company_Address: string
  email: string
  mobile: string
}

export interface CreateCustomerRequest {
  company_Name: string
  customer_Code: string
  address: string
  company_Address: string
  email: string
  mobile: string
}

export interface UpdateCustomerRequest {
  company_Name?: string
  customer_Code?: string
  address?: string
  company_Address?: string
  email?: string
  mobile?: string
}

export interface CustomerState {
  customers: Customer[]
  currentCustomer: Customer | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
