import { Entity } from './common'

export interface Vendor extends Entity {
  company_Name?: string
  vendor_Name?: string
  vendor_Code?: string
  company_Address?: string
  address?: string
  email?: string
  phone_No?: string
  mobile?: string
}

export interface CreateVendorRequest {
  company_Name: string
  vendor_Code: string
  company_Address: string
  email: string
  mobile: string
}

export interface UpdateVendorRequest {
  company_Name?: string
  vendor_Code?: string
  company_Address?: string
  email?: string
  mobile?: string
}

export interface VendorState {
  vendors: Vendor[]
  currentVendor: Vendor | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
