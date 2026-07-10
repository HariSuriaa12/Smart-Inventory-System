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
  Sales_Id: number
  Item_Id: number
  Sold_Quantity: number
  Sub_Total: number
  Is_Promotion: boolean
  Discount_Percentage: number
  item?: Item
}

export interface Sales extends Entity {
  Location_Id: number
  Sales_Status: SalesStatus
  Sales_Date: string | Date
  Sales_Time: string
  Is_Reserved: boolean
  Sales_Number: string
  Ref_Sales_Number?: number
  items?: SalesItem[]
  location?: Location
}

export interface ReceiveSalesRequest {
  salesData: {
    Location_Id: number
    Sales_Status: SalesStatus
    Sales_Date: string | Date
    Sales_Time: string
    Is_Reserved: boolean
    Sales_Number: string
    items: {
      Item_Id: number
      Sold_Quantity: number
      Sub_Total: number
      Is_Promotion: boolean
      Discount_Percentage: number
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
