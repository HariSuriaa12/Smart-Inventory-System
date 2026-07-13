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
  item_Id: number
  item_Name: string
  item_Code: string
  item_Category: string
  unit_Of_Measure: string
  order_Quantity: number
  unit_Price: number
  status: PurchaseOrderStatus
  sub_Total: number
  received_Quantity: number
  item?: Item
}

export interface PurchaseOrder extends Entity {
  id: number
  pO_Reference_No: string
  location_Id: number
  purchase_Date: string | Date
  location_Name: string
  purchase_Time: string
  vendor_Id: number
  vendor_Code: string
  vendor_Mobile : string
  vendor_Company_Address : string
  user_full_name : string
  user_staff_Code : string
  user_mobile_No : string
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
  poRefNo: string
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
