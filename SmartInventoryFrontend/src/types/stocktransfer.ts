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
  From_Location_Id: number
  To_Location_Id: number
  Transfer_Date: string | Date
  Transfer_Time: string
  Item_Id: number
  Transfer_Quantity: number
  Remark?: string
  Status: StockTransferStatus
  Sub_Total: number
  Performed_By: number
  FromLocation?: Location
  ToLocation?: Location
  Item?: Item
  Performed_ByUser?: User
}

export interface CreateStockTransferRequest {
  From_Location_Id: number
  To_Location_Id: number
  Item_Id: number
  Transfer_Quantity: number
  Transfer_Date: string | Date
  Transfer_Time: string
  Remark?: string
}

export interface UpdateStockTransferRequest {
  Status?: StockTransferStatus
  Remark?: string
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
