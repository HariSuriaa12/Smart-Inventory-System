import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'
import { Customer } from './customer'
import { User } from './auth'

export enum OrderFulfillmentStatus {
  Unassigned = 0,
  OnHold = 1,
  PartiallyFulfilled = 2,
  Fulfilled = 3,
  Cancelled = 4,
  Verified = 5,
}

export const OrderFulfillmentStatusLabel: Record<OrderFulfillmentStatus, string> = {
  [OrderFulfillmentStatus.Unassigned]: 'Unassigned',
  [OrderFulfillmentStatus.OnHold]: 'On Hold',
  [OrderFulfillmentStatus.PartiallyFulfilled]: 'Partially Fulfilled',
  [OrderFulfillmentStatus.Fulfilled]: 'Fulfilled',
  [OrderFulfillmentStatus.Cancelled]: 'Cancelled',
  [OrderFulfillmentStatus.Verified]: 'Verified',
}

export interface OrderFulfillmentItem extends Entity {
  fulfillment_Id: number
  item_Id: number
  item_Code?: string
  item_Name?: string
  item_Category?: string
  unit_Of_Measure?: string
  request_Quantity: number
  unit_Price: number
  status: OrderFulfillmentStatus
  sub_Total: number
  shipped_Quantity: number
  item?: Item
}

export interface OrderFulfillment extends Entity {
  id: number
  location_Id: number
  location_Name?: string
  order_Date: string | Date
  order_Time?: string
  shipment_Address_Line_1?: string
  shipment_Address_Line_2?: string
  shipment_City?: string
  shipment_State?: string
  shipment_PostCode?: string
  shipment_Country_Code?: string
  remark?: string
  status: OrderFulfillmentStatus
  verified_By: number
  verified_By_Name?: string
  total_Amount: number
  customer_Id: number
  customer_Name?: string
  items?: OrderFulfillmentItem[]
  location?: Location
  customer?: Customer
  verified_ByUser?: User
}

export interface ReceiveOrderFulfillmentRequest {
  Customer_ID: number
  Order_Date: string
  Shipment_Address_Line_1?: string
  Shipment_Address_Line_2?: string
  Shipment_City?: string
  Shipment_State?: string
  Shipment_PostCode?: string
  Shipment_Country_Code?: string
  Items: {
    Item_ID: number
    Request_Quantity: number
    Unit_Price: number
  }[]
}

export interface OrderFulfillmentFilters {
  skip: number
  take: number
  fulfillmentId?: number
  customerId?: number
  unprocessedOnly?: boolean
  locationId?: number
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
