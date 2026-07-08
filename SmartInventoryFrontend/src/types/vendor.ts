import { Entity } from './common'

export interface Vendor extends Entity {
  companyName: string
  vendorCode: string
  companyAddress: string
  email: string
  mobile: string
}

export interface CreateVendorRequest {
  companyName: string
  vendorCode: string
  companyAddress: string
  email: string
  mobile: string
}

export interface UpdateVendorRequest {
  companyName?: string
  vendorCode?: string
  companyAddress?: string
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
