import { Entity } from './common'

export interface Location extends Entity {
  locationName: string
  outletCode: string
  locationType: number
  address: string
}

export interface CreateLocationRequest {
  locationName: string
  outletCode: string
  locationType: number
  address: string
}

export interface UpdateLocationRequest {
  locationName?: string
  outletCode?: string
  locationType?: number
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
