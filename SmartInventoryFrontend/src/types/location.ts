import { Entity } from './common'
import { UserRole } from './user'

export interface Location extends Entity {
  location_Name: string
  outlet_Code: string
  location_Type: number
  address: string
  creation_Date: Date
}

export enum LocationType {
  Outlet = 0,
  Warehouse = 1,
  Distribution_Center = 2,
}

export const LocationTypeLabel: Record<LocationType, string> = {
  [LocationType.Outlet]: 'Outlet',
  [LocationType.Warehouse]: 'Warehouse',
  [LocationType.Distribution_Center]: 'Distribution Center',
}

export interface CreateLocationRequest {
  location_Name: string
  outlet_Code: string
  location_Type: number
  address: string
}

export interface UpdateLocationRequest {
  location_Name?: string
  outlet_Code?: string
  location_Type?: number
  address?: string
}

export interface LocationState {
  locations: Location[]
  currentLocation: Location | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
