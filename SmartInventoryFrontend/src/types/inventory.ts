import { Entity } from './common'

export interface Inventory {
  ID: number
  Item_ID: number
  Location_ID: number
  OnHand_Quantity: number
  Available_Quantity: number
  Is_Deleted: boolean
  Item?: InventoryItemDetail
  Location?: InventoryLocationDetail
}

export interface InventoryItemDetail {
  ID: number
  Item_Name?: string
  Item_Code?: string
  Description?: string
  Item_Category?: string
  Item_Brand?: string
  Purchase_Cost: number
  Unit_Cost: number
  Is_Active: boolean
  Unit_Of_Measure?: string
  Remark?: string
  Creation_Date: string
  Is_Deleted: boolean
  Item_Image_URL?: string
  Tax_Percentage: number
  Tax_Type?: string
  Item_Type?: string
}

export interface InventoryLocationDetail {
  ID: number
  Location_Name?: string
  Outlet_Code?: string
  Location_Type: number
  Address?: string
  Creation_Date: string
  Is_Deleted: boolean
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
