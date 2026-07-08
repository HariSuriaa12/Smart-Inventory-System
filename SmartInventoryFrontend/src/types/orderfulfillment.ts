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
  fulfillmentId: number
  itemId: number
  requestQuantity: number
  unitPrice: number
  status: OrderFulfillmentStatus
  subTotal: number
  shippedQuantity: number
  item?: Item
}

export interface OrderFulfillment extends Entity {
  locationId: number
  orderDate: string | Date
  orderTime: string
  shipmentAddressLine1: string
  shipmentAddressLine2?: string
  shipmentCity: string
  shipmentState: string
  shipmentPostCode: string
  shipmentCountryCode: string
  remark?: string
  status: OrderFulfillmentStatus
  verifiedBy: number
  totalAmount: number
  customerId: number
  items?: OrderFulfillmentItem[]
  location?: Location
  customer?: Customer
  verifiedByUser?: User
}

export interface ReceiveOrderFulfillmentRequest {
  itemId: number
  shippedQuantity: number
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
