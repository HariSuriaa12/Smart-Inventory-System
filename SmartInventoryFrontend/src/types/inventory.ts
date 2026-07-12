import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'

export interface Inventory extends Entity {
  ID: number
  Item_ID: number
  Location_ID: number
  OnHand_Quantity: number
  Available_Quantity: number
  Item_Name?: string
  Location_Name?: string
}

export interface AdjustInventoryRequest {
  Item_ID: number
  Location_ID: number
  QuantityAdjustment: number
  Remark?: string
}

export interface StockTransferRequest {
  From_Location_ID: number
  To_Location_ID: number
  Item_ID: number
  Transfer_Quantity: number
  Remark?: string
}

export interface InventoryFilters {
  skip: number
  take: number
  locationId?: number
  itemId?: number
  lowStockOnly?: boolean
}

export interface InventoryState {
  inventory: Inventory[]
  currentInventory: Inventory | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
