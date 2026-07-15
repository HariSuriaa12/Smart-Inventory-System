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

export interface SalesItem {
  id: number
  item_ID: number
  item_Name?: string
  item_Code?: string
  item_Category?: string
  unit_Of_Measure?: string
  sold_Quantity: number
  sub_Total: number
  is_Promotion: boolean
  discount_Percentage: number
}

export interface Sales {
  id: number
  location_ID: number
  location_Name?: string
  sales_Status: SalesStatus
  sales_Date: string | Date
  sales_Time: string
  sales_Number?: string
  total_Amount: number
  creation_Date?: string | Date
  items?: SalesItem[]
}

export interface SalesFilters {
  skip: number
  take: number
  salesId?: number
  salesNumber?: string
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
}
