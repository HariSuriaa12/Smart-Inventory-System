import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'

export enum SalesStatus {
  Pending = 0,
  Completed = 1,
  Cancelled = 2,
}

export const SalesStatusLabel: Record<SalesStatus, string> = {
  [SalesStatus.Pending]: 'Pending',
  [SalesStatus.Completed]: 'Completed',
  [SalesStatus.Cancelled]: 'Cancelled',
}

export interface SalesItem extends Entity {
  salesId: number
  itemId: number
  soldQuantity: number
  subTotal: number
  isPromotion: boolean
  discountPercentage: number
  item?: Item
}

export interface Sales extends Entity {
  locationId: number
  salesStatus: SalesStatus
  salesDate: string | Date
  salesTime: string
  isReserved: boolean
  salesNumber: string
  refSalesNumber?: number
  items?: SalesItem[]
  location?: Location
}

export interface ReceiveSalesRequest {
  salesData: {
    locationId: number
    salesStatus: SalesStatus
    salesDate: string | Date
    salesTime: string
    isReserved: boolean
    salesNumber: string
    items: {
      itemId: number
      soldQuantity: number
      subTotal: number
      isPromotion: boolean
      discountPercentage: number
    }[]
  }[]
}

export interface SalesFilters {
  skip: number
  take: number
  locationId?: number
  status?: SalesStatus
  dateFrom?: string
  dateTo?: string
}

export interface SalesState {
  sales: Sales[]
  currentSale: Sales | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
