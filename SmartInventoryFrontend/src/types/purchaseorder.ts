import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'
import { Vendor } from './vendor'
import { User } from './auth'

export enum PurchaseOrderStatus {
  Pending = 0,
  Confirmed = 1,
  PartiallyReceived = 2,
  Received = 3,
  Cancelled = 4,
}

export const PurchaseOrderStatusLabel: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Pending]: 'Pending',
  [PurchaseOrderStatus.Confirmed]: 'Confirmed',
  [PurchaseOrderStatus.PartiallyReceived]: 'Partially Received',
  [PurchaseOrderStatus.Received]: 'Received',
  [PurchaseOrderStatus.Cancelled]: 'Cancelled',
}

export interface PurchaseOrderItem extends Entity {
  pO_Id: number
  iTem_Id: number
  order_Quantity: number
  unit_Price: number
  status: PurchaseOrderStatus
  sub_Total: number
  received_Quantity: number
  item?: Item
}

export interface PurchaseOrder extends Entity {
  pO_Reference_No: string
  location_Id: number
  purchase_Date: string | Date
  purchase_Time: string
  vendor_Id: number
  vendor_Code: string
  company_Address : string
  full_name : string
  staff_Code : string
  mobile_No : string
  status: PurchaseOrderStatus
  remark?: string
  performed_By: number
  total_Amount: number
  items?: PurchaseOrderItem[]
  location?: Location
  vendor?: Vendor
  performed_ByUser?: User
}

export interface CreatePurchaseOrderRequest {
  locationId: number
  vendorId: number
  purchaseDate: string | Date
  purchaseTime: string
  remark?: string
  items: {
    itemId: number
    orderQuantity: number
    unitPrice: number
  }[]
}

export interface UpdatePurchaseOrderRequest {
  locationId?: number
  vendorId?: number
  purchaseDate?: string | Date
  purchaseTime?: string
  remark?: string
  status?: PurchaseOrderStatus
}

export interface ReceivePurchaseOrderItemRequest {
  poItemId: number
  receivedQuantity: number
}

export interface PurchaseOrderFilters {
  skip: number
  take: number
  status?: PurchaseOrderStatus
  vendorId?: number
  locationId?: number
  dateFrom?: string
  dateTo?: string
}

export interface PurchaseOrderState {
  orders: PurchaseOrder[]
  currentOrder: PurchaseOrder | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
