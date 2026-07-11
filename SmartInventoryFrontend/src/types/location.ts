import { Entity } from './common'

export interface Location extends Entity {
  location_Name: string
  outlet_Code: string
  location_Type: number
  address: string
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
