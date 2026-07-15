import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'
import { User } from './auth'

export enum StockTransferStatus {
  Shipped = 0,
  PartiallyReceived = 1,
  Received = 2,
  Cancelled = 3,
}

export const StockTransferStatusLabel: Record<StockTransferStatus, string> = {
  [StockTransferStatus.Shipped]: 'Shipped',
  [StockTransferStatus.PartiallyReceived]: 'Partially Received',
  [StockTransferStatus.Received]: 'Received',
  [StockTransferStatus.Cancelled]: 'Cancelled',
}

export interface StockTransfer extends Entity {
  id: number
  from_Location_Id: number
  from_Location_Name?: string
  to_Location_Id: number
  to_Location_Name?: string
  transfer_Date: string | Date
  transfer_Time: string
  item_Id: number
  item_Name?: string
  item_Code?: string
  transfer_Quantity: number
  received_Quantity: number
  remark?: string
  status: StockTransferStatus
  sub_Total: number
  performed_By: number
  user_Full_Name?: string
  user_Staff_Code?: string
  fromLocation?: Location
  toLocation?: Location
  item?: Item
  performed_ByUser?: User
}

export interface CreateStockTransferRequest {
  from_Location_Id: number
  to_Location_Id: number
  item_Id: number
  transfer_Quantity: number
  transfer_Date: string | Date
  transfer_Time: string
  remark?: string
  performed_By: number
}

export interface UpdateStockTransferRequest {
  status?: StockTransferStatus
  received_Quantity?: number
  remark?: string
}

export interface StockTransferFilters {
  skip: number
  take: number
  id?: number
  status?: StockTransferStatus
  transferType?: 'shipped' | 'received'
  fromLocationId?: number
  toLocationId?: number
  itemId?: number
  dateFrom?: string
  dateTo?: string
}

export interface StockTransferState {
  transfers: StockTransfer[]
  currentTransfer: StockTransfer | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
