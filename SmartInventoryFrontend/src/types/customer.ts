import { Entity } from './common'

export interface Customer extends Entity {
  companyName: string
  customerCode: string
  address: string
  companyAddress: string
  email: string
  mobile: string
}

export interface CreateCustomerRequest {
  companyName: string
  customerCode: string
  address: string
  companyAddress: string
  email: string
  mobile: string
}

export interface UpdateCustomerRequest {
  companyName?: string
  customerCode?: string
  address?: string
  companyAddress?: string
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
