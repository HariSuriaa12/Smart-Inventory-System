import { Entity } from './common'

export interface Item extends Entity {
  itemName: string
  itemCode: string
  description?: string
  itemCategory: string
  itemBrand?: string
  purchaseCost: number
  unitCost: number
  isActive: boolean
  unitOfMeasure: string
  remark?: string
  itemImageUrl?: string
  taxPercentage?: number
  taxType?: string
  itemType?: string
}

export interface CreateItemRequest {
  itemName: string
  itemCode: string
  description?: string
  itemCategory: string
  itemBrand?: string
  purchaseCost: number
  unitCost: number
  isActive: boolean
  unitOfMeasure: string
  remark?: string
  itemImageUrl?: string
  taxPercentage?: number
  taxType?: string
  itemType?: string
}

export interface UpdateItemRequest {
  itemName?: string
  itemCode?: string
  description?: string
  itemCategory?: string
  itemBrand?: string
  purchaseCost?: number
  unitCost?: number
  isActive?: boolean
  unitOfMeasure?: string
  remark?: string
  itemImageUrl?: string
  taxPercentage?: number
  taxType?: string
  itemType?: string
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
}
