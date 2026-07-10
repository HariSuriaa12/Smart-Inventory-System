import { Entity } from './common'

export interface Location extends Entity {
  Location_Name: string
  Outlet_Code: string
  Location_Type: number
  Address: string
}

export interface CreateLocationRequest {
  Location_Name: string
  Outlet_Code: string
  Location_Type: number
  Address: string
}

export interface UpdateLocationRequest {
  Location_Name?: string
  Outlet_Code?: string
  Location_Type?: number
  Address?: string
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
