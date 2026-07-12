import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'
import { User } from './auth'

export enum StockTransferStatus {
  Pending = 0,
  InTransit = 1,
  Received = 2,
  Cancelled = 3,
}

export const StockTransferStatusLabel: Record<StockTransferStatus, string> = {
  [StockTransferStatus.Pending]: 'Pending',
  [StockTransferStatus.InTransit]: 'In Transit',
  [StockTransferStatus.Received]: 'Received',
  [StockTransferStatus.Cancelled]: 'Cancelled',
}

export interface StockTransfer extends Entity {
  from_Location_Id: number
  to_Location_Id: number
  transfer_Date: string | Date
  transfer_Time: string
  item_Id: number
  transfer_Quantity: number
  remark?: string
  status: StockTransferStatus
  sub_Total: number
  performed_By: number
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
  remark?: string
}

export interface StockTransferFilters {
  skip: number
  take: number
  status?: StockTransferStatus
  fromLocationId?: number
  toLocationId?: number
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
