import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'

export interface Inventory extends Entity {
  Item_Id: number
  Location_Id: number
  On_Hand_Quantity: number
  Available_Quantity: number
  Item?: Item
  Location?: Location
}

export interface AdjustInventoryRequest {
  adjustment: number
  remark?: string
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
