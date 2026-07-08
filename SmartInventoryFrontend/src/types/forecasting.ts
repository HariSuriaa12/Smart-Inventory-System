import { Entity } from './common'
import { Item } from './item'
import { Location } from './location'

export enum ForecastMethod {
  ANN = 0,
  MA = 1,
}

export const ForecastMethodLabel: Record<ForecastMethod, string> = {
  [ForecastMethod.ANN]: 'Artificial Neural Network',
  [ForecastMethod.MA]: 'Moving Average',
}

export interface ForecastedResult extends Entity {
  itemId: number
  locationId: number
  forecastedPeriodInDays: number
  forecastedQuantity: number
  forecastMethod: ForecastMethod
  modelVersion: string
  item?: Item
  location?: Location
}

export interface ForecastingFilters {
  skip: number
  take: number
  itemId?: number
  locationId?: number
  method?: ForecastMethod
  dateFrom?: string
  dateTo?: string
}

export interface ForecastingState {
  forecasts: ForecastedResult[]
  currentForecast: ForecastedResult | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
