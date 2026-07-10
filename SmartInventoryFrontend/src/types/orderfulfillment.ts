import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'
import { Customer } from './customer'
import { User } from './auth'

export enum OrderFulfillmentStatus {
  Pending = 0,
  Processing = 1,
  PartiallyShipped = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5,
}

export const OrderFulfillmentStatusLabel: Record<OrderFulfillmentStatus, string> = {
  [OrderFulfillmentStatus.Pending]: 'Pending',
  [OrderFulfillmentStatus.Processing]: 'Processing',
  [OrderFulfillmentStatus.PartiallyShipped]: 'Partially Shipped',
  [OrderFulfillmentStatus.Shipped]: 'Shipped',
  [OrderFulfillmentStatus.Delivered]: 'Delivered',
  [OrderFulfillmentStatus.Cancelled]: 'Cancelled',
}

export interface OrderFulfillmentItem extends Entity {
  Fulfillment_Id: number
  Item_Id: number
  Request_Quantity: number
  Unit_Price: number
  Status: OrderFulfillmentStatus
  Sub_Total: number
  Shipped_Quantity: number
  Item?: Item
}

export interface OrderFulfillment extends Entity {
  Location_Id: number
  Order_Date: string | Date
  Order_Time: string
  Shipment_Address_Line_1: string
  Shipment_Address_Line_2?: string
  Shipment_City: string
  Shipment_State: string
  Shipment_PostCode: string
  Shipment_Country_Code: string
  Remark?: string
  Status: OrderFulfillmentStatus
  Verified_By: number
  Total_Amount: number
  Customer_Id: number
  Items?: OrderFulfillmentItem[]
  Location?: Location
  Customer?: Customer
  Verified_ByUser?: User
}

export interface ReceiveOrderFulfillmentRequest {
  Item_Id: number
  Shipped_Quantity: number
}

export interface OrderFulfillmentFilters {
  skip: number
  take: number
  status?: OrderFulfillmentStatus
  customerId?: number
  locationId?: number
  dateFrom?: string
  dateTo?: string
}

export interface OrderFulfillmentState {
  orders: OrderFulfillment[]
  currentOrder: OrderFulfillment | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
