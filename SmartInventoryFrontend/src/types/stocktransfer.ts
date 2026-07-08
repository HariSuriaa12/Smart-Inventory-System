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
  fromLocationId: number
  toLocationId: number
  transferDate: string | Date
  transferTime: string
  itemId: number
  transferQuantity: number
  remark?: string
  status: StockTransferStatus
  subTotal: number
  performedBy: number
  fromLocation?: Location
  toLocation?: Location
  item?: Item
  performedByUser?: User
}

export interface CreateStockTransferRequest {
  fromLocationId: number
  toLocationId: number
  itemId: number
  transferQuantity: number
  transferDate: string | Date
  transferTime: string
  remark?: string
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
