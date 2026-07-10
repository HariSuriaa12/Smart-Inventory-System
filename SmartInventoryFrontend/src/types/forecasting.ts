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
  Item_Id: number
  Location_Id: number
  Forecasted_Period_In_Days: number
  Forecasted_Quantity: number
  Forecast_Method: ForecastMethod
  Model_Version: string
  Item?: Item
  Location?: Location
}

export interface ForecastingFilters {
  skip: number
  take: number
  Item_Id?: number
  Location_Id?: number
  Method?: ForecastMethod
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
