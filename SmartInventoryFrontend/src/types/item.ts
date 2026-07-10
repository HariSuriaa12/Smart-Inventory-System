import { Entity } from './common'

export interface Item extends Entity {
  Item_Name: string
  Item_Code: string
  Description?: string
  Item_Category: string
  Item_Brand?: string
  Purchase_Cost: number
  Unit_Cost: number
  Is_Active: boolean
  Unit_Of_Measure: string
  Remark?: string
  Item_Image_Url?: string
  Tax_Percentage?: number
  Tax_Type?: string
  Item_Type?: string
}

export interface CreateItemRequest {
  Item_Name: string
  Item_Code: string
  Description?: string
  Item_Category: string
  Item_Brand?: string
  Purchase_Cost: number
  Unit_Cost: number
  Is_Active: boolean
  Unit_Of_Measure: string
  Remark?: string
  Item_Image_Url?: string
  Tax_Percentage?: number
  Tax_Type?: string
  Item_Type?: string
}

export interface UpdateItemRequest {
  Item_Name: string
  Item_Code: string
  Description?: string
  Item_Category: string
  Item_Brand?: string
  Purchase_Cost: number
  Unit_Cost: number
  Is_Active: boolean
  Unit_Of_Measure: string
  Remark?: string
  Item_Image_Url?: string
  Tax_Percentage?: number
  Tax_Type?: string
  Item_Type?: string
}

export interface ItemFilters {
  skip: number
  take: number
  searchQuery?: string
  category?: string
  isActive?: boolean
}

export interface ItemState {
  items: Item[]
  currentItem: Item | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
  searchQuery: string | null
}
