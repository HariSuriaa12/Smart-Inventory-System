import { api, forecastApi } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { itemService } from './itemService'

export interface DashboardStats {
  totalItems: number
  totalLocations: number
  pendingOrders: number
}

export interface DashboardAlert {
  id: string
  type: 'low-stock' | 'pending-order'
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface LocationInventoryData {
  itemId: number
  itemCode: string
  itemName: string
  onHandQty: number
  availableQty: number
  value: number
}

export interface TopSellingItem {
  itemId: number
  itemCode: string
  itemName: string
  totalQty: number
  totalValue: number
  averagePrice: number
}

export interface ForecastedResult {
  id: number
  itemId: number
  itemCode: string
  itemName: string
  forecastedQuantity: number
  forecastMethod: number
  modelVersion: string
  creationDate: string
}

export interface ForecastedResult_Py {
  status: string
  rowsPredicted: number
  annRows: number
  maRows: string
  data: ForecastedResultData_Py[]
}

export interface ForecastedResultData_Py {
  Date: string
  ItemID: number
  ItemCode: string
  ItemName: string
  LocationID: number
  Method: number
  PredictedDemandNext30Days: number
  QtyConsumption30Days_Y1: number
  QtyConsumption30Days_M5: number
  QtyConsumption30Days_M4: number
  QtyConsumption30Days_M3: number
  QtyConsumption30Days_M2: number
  QtyConsumption30Days_M1: number
  QtyConsumption30Days: number
  Best_Method: string
}

export const dashboardService = {
  // Get master stats - master data endpoints
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [itemsRes, locationsRes, poRes] = await Promise.all([
        api.get<ApiResponse<PaginatedResponse<any>>>('/api/items', { params: { skip: 0, take: 1 } }),
        api.get<ApiResponse<PaginatedResponse<any>>>('/api/locations', { params: { skip: 0, take: 1 } }),
        api.get<ApiResponse<PaginatedResponse<any>>>('/api/purchaseorders', { params: { skip: 0, take: 1, status: 0 } }),
      ])

      return {
        totalItems: itemsRes.data?.data?.total || 0,
        totalLocations: locationsRes.data?.data?.total || 0,
        pendingOrders: poRes.data?.data?.total || 0,
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      return {
        totalItems: 0,
        totalLocations: 0,
        pendingOrders: 0,
      }
    }
  },

  // Get location inventory - for dashboard display
  getLocationInventory: async (locationId: number): Promise<LocationInventoryData[]> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<any>>>(`/api/inventory/location/${locationId}`, {
        params: { skip: 0, take: 100 },
      })
      console.log('Location inventory response:', response.data)
      return (
        response.data?.data?.data?.map((x: any) => ({
          date: x.Date || new Date().toISOString(),
          itemId: x.item_ID,
          itemCode: x.item?.item_Code || '',
          itemName: x.item?.item_Name || '',
          onHandQty: x.on_Hand_Quantity || 0,
          availableQty: x.available_Quantity || 0,
          value: (x.available_Quantity || 0) * (x.item?.unit_Cost || 0),
        })) || []
      )
    } catch (error) {
      console.error('Failed to fetch location inventory:', error)
      return []
    }
  },

  // Get location alerts
  getLocationAlerts: async (locationId: number): Promise<DashboardAlert[]> => {
    try {
      const alerts: DashboardAlert[] = []

      // Fetch inventory for low stock check
      const inventory = await dashboardService.getLocationInventory(locationId)

      let alertId = 1
      inventory.forEach((item) => {
        if (item.availableQty < 10/* && item.availableQty >= 0*/) {
          alerts.push({
            id: `alert-${alertId++}`,
            type: 'low-stock',
            message: `${item.itemName} is running low (${item.availableQty.toFixed(2)} units)`,
            severity: item.availableQty < 5 ? 'error' : 'warning',
          })
        }
      })

      // Get pending orders
      const poResponse = await api.get<ApiResponse<PaginatedResponse<any>>>('/api/purchaseorders', {
        params: { skip: 0, take: 100, status: 0 },
      })

      const pendingCount = poResponse.data?.data?.total || 0
      if (pendingCount > 0) {
        alerts.push({
          id: `alert-${alertId++}`,
          type: 'pending-order',
          message: `You have ${pendingCount} pending purchase orders`,
          severity: 'info',
        })
      }

      return alerts.slice(0, 5)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      return []
    }
  },

  // Get top selling items by location
  getTopSellingItems: async (locationId: number): Promise<TopSellingItem[]> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/api/sales/top-selling/${locationId}`, {
        params: { skip: 0, take: 10 },
      })

      return response.data?.data || []
    } catch (error) {
      console.error('Failed to fetch top selling items:', error)
      return []
    }
  },

  // Get inventory trend
  getInventoryTrend: async (locationId: number) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/api/inventory/trend/${locationId}`)
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to fetch inventory trend:', error)
      return []
    }
  },

  // // Get forecasts by location
  // getForecasts: async (locationId: number): Promise<ForecastedResult[]> => {
  //   try {
  //     const response = await forecastApi.get<ApiResponse<PaginatedResponse<any>>>(`/api/forecast/run/location/${locationId}`)
  //     console.log('Forecasts response:', response.data)
  //     return (
  //       response.data?.data?.data?.map((forecast: any) => ({
  //         id: forecast.iD,
  //         itemId: forecast.item_ID,
  //         itemCode: forecast.item_Code || '',
  //         itemName: forecast.item_Name || '',
  //         forecastedQuantity: forecast.forecasted_Quantity || 0,
  //         forecastMethod: forecast.forecast_Method || 0,
  //         modelVersion: forecast.model_Version || '0',
  //         creationDate: forecast.creation_Date || new Date().toISOString(),
  //       })) || []
  //     )
  //   } catch (error) {
  //     console.error('Failed to fetch forecasts:', error)
  //     return []
  //   }
  // },

  getForecasts: async (locationId: number): Promise<ForecastedResultData_Py[]> => {
    try {
      const response = await forecastApi.post<ForecastedResult_Py>(`/api/forecast/run/location/${locationId}`)
      const itemResponse = await itemService.getItems(0, 999999)
      console.log('Forecasts response:', response.data)
      console.log('Forecasts Item response:', itemResponse.data)
      return (
        response.data?.data?.map((forecast: any) => ({
          Date: forecast.Date || new Date().toISOString(),
          ItemID: forecast.ItemID,
          ItemCode: itemResponse.data?.data?.find((item) => item.id === forecast.ItemID)?.item_Code || '',
          ItemName: itemResponse.data?.data?.find((item) => item.id === forecast.ItemID)?.item_Name || '',
          LocationID: forecast.LocationID,
          Method: forecast.Best_Method || 0,
          PredictedDemandNext30Days: forecast.PredictedDemandNext30Days || 0,
          QtyConsumption30Days_Y1: forecast.QtyConsumption30Days_Y1 || 0,
          QtyConsumption30Days_M5: forecast.QtyConsumption30Days_M5 || 0,
          QtyConsumption30Days_M4: forecast.QtyConsumption30Days_M4 || 0,
          QtyConsumption30Days_M3: forecast.QtyConsumption30Days_M3 || 0,
          QtyConsumption30Days_M2: forecast.QtyConsumption30Days_M2 || 0,
          QtyConsumption30Days_M1: forecast.QtyConsumption30Days_M1 || 0,
          QtyConsumption30Days: forecast.QtyConsumption30Days || 0,
          Best_Method: forecast.Best_Method || 'ANN',
        })) || []
      )
    } catch (error) {
      console.error('Failed to fetch forecasts:', error)
      return []
    }
  },

  // Get sales by location
  getSalesByLocation: async (locationId: number) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/api/sales/location/${locationId}`, {
        params: { skip: 0, take: 50 },
      })
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to fetch sales:', error)
      return []
    }
  },
}
