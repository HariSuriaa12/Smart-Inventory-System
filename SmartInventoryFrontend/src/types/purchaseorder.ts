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
  PO_Id: number
  Item_Id: number
  Order_Quantity: number
  Unit_Price: number
  Status: PurchaseOrderStatus
  Sub_Total: number
  Received_Quantity: number
  item?: Item
}

export interface PurchaseOrder extends Entity {
  PO_Reference_No: string
  Location_Id: number
  Purchase_Date: string | Date
  Purchase_Time: string
  Vendor_Id: number
  Status: PurchaseOrderStatus
  Remark?: string
  Performed_By: number
  Total_Amount: number
  Items?: PurchaseOrderItem[]
  Location?: Location
  Vendor?: Vendor
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
