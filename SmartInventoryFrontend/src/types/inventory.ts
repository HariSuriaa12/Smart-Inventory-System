import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'

export interface Inventory extends Entity {
  itemId: number
  locationId: number
  onHandQuantity: number
  availableQuantity: number
  item?: Item
  location?: Location
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
