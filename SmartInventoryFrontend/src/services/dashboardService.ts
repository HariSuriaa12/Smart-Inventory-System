import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'

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
        response.data?.data?.data?.map((inv: any) => ({
          itemId: inv.item_ID,
          itemCode: inv.item?.item_Code || '',
          itemName: inv.item?.item_Name || '',
          onHandQty: inv.on_Hand_Quantity || 0,
          availableQty: inv.available_Quantity || 0,
          value: (inv.available_Quantity || 0) * (inv.item?.unit_Cost || 0),
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
        if (item.availableQty < 10 && item.availableQty >= 0) {
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

  // Get forecasts by location
  getForecasts: async (locationId: number): Promise<ForecastedResult[]> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<any>>>(`/api/forecasting/location/${locationId}`, {
        params: { skip: 0, take: 100 },
      })
      console.log('Forecasts response:', response.data)
      return (
        response.data?.data?.data?.map((forecast: any) => ({
          id: forecast.iD,
          itemId: forecast.item_ID,
          itemCode: forecast.item_Code || '',
          itemName: forecast.item_Name || '',
          forecastedQuantity: forecast.forecasted_Quantity || 0,
          forecastMethod: forecast.forecast_Method || 0,
          modelVersion: forecast.model_Version || '0',
          creationDate: forecast.creation_Date || new Date().toISOString(),
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
