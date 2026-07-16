import { itemService } from './itemService'
import { locationService } from './locationService'
import { inventoryService } from './inventoryService'
import { salesService } from './salesService'
import { purchaseOrderService } from './purchaseOrderService'
import { forecastingService } from './forecastingService'

export interface DashboardStats {
  totalItems: number
  totalLocations: number
  pendingOrders: number
  lowStockItems: number
  totalStockValue: number
}

export interface DashboardAlert {
  id: string
  type: 'low-stock' | 'pending-order' | 'overstock'
  message: string
  severity: 'error' | 'warning' | 'info'
  itemName?: string
  quantity?: number
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

export interface InventoryTrendData {
  month: string
  value: number
  items: number
}

export const dashboardService = {
  // Get master stats (all data)
  getStats: async (): Promise<DashboardStats> => {
    try {
      const itemsResponse = await itemService.getAllItems({ skip: 0, take: 1000 })
      const locationsResponse = await locationService.getAllLocations()
      const poResponse = await purchaseOrderService.getPurchaseOrders({
        skip: 0,
        take: 1000,
        status: 0, // Only pending orders
      })

      const totalItems = itemsResponse.data?.total || 0
      const totalLocations = locationsResponse.data?.length || 0
      const pendingOrders = poResponse.data?.total || 0

      return {
        totalItems,
        totalLocations,
        pendingOrders,
        lowStockItems: 0,
        totalStockValue: 0,
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      return {
        totalItems: 0,
        totalLocations: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalStockValue: 0,
      }
    }
  },

  // Get location-specific inventory data
  getLocationInventory: async (locationId: number): Promise<LocationInventoryData[]> => {
    try {
      const response = await inventoryService.getInventoryByLocation(locationId, 0, 100)
      return (
        response.data?.map((inv: any) => ({
          itemId: inv.item_ID,
          itemCode: inv.item?.item_Code || '',
          itemName: inv.item?.item_Name || '',
          onHandQty: inv.on_Hand_Quantity || 0,
          availableQty: inv.available_Quantity || 0,
          value: (inv.available_Quantity || 0) * (inv.item?.unit_Price || 0),
        })) || []
      )
    } catch (error) {
      console.error('Failed to fetch location inventory:', error)
      return []
    }
  },

  // Get alerts for location
  getLocationAlerts: async (locationId: number): Promise<DashboardAlert[]> => {
    try {
      const inventory = await dashboardService.getLocationInventory(locationId)
      const alerts: DashboardAlert[] = []
      let alertId = 1

      // Check for low stock items (less than 10 units)
      inventory.forEach((item) => {
        if (item.availableQty < 10 && item.availableQty >= 0) {
          alerts.push({
            id: `alert-${alertId++}`,
            type: 'low-stock',
            message: `${item.itemName} is running low (${item.availableQty.toFixed(2)} units)`,
            severity: item.availableQty < 5 ? 'error' : 'warning',
            itemName: item.itemName,
            quantity: item.availableQty,
          })
        }
      })

      // Get pending orders
      try {
        const poResponse = await purchaseOrderService.getPurchaseOrders({
          skip: 0,
          take: 100,
          status: 0,
        })

        const pendingCount = poResponse.data?.total || 0
        if (pendingCount > 0) {
          alerts.push({
            id: `alert-${alertId++}`,
            type: 'pending-order',
            message: `You have ${pendingCount} pending purchase orders`,
            severity: 'info',
          })
        }
      } catch (err) {
        console.error('Failed to fetch pending orders:', err)
      }

      return alerts.slice(0, 5) // Return top 5 alerts
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      return []
    }
  },

  // Get top selling items for location
  getTopSellingItems: async (locationId: number): Promise<TopSellingItem[]> => {
    try {
      const salesResponse = await salesService.getSalesByLocation(locationId, 0, 500)

      if (!salesResponse.data || salesResponse.data.length === 0) {
        return []
      }

      // Group sales by item
      const itemSales: { [key: number]: TopSellingItem } = {}

      salesResponse.data.forEach((sale: any) => {
        if (!sale.item_ID) return

        if (!itemSales[sale.item_ID]) {
          itemSales[sale.item_ID] = {
            itemId: sale.item_ID,
            itemCode: sale.item?.item_Code || '',
            itemName: sale.item?.item_Name || '',
            totalQty: 0,
            totalValue: 0,
            averagePrice: 0,
          }
        }

        const qty = sale.quantity || 0
        const price = sale.unit_Price || 0

        itemSales[sale.item_ID].totalQty += qty
        itemSales[sale.item_ID].totalValue += qty * price
      })

      // Calculate average price and sort by total value
      Object.values(itemSales).forEach((item) => {
        if (item.totalQty > 0) {
          item.averagePrice = item.totalValue / item.totalQty
        }
      })

      return Object.values(itemSales)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10)
    } catch (error) {
      console.error('Failed to fetch top selling items:', error)
      return []
    }
  },

  // Get inventory value trend
  getInventoryTrend: async (locationId: number): Promise<InventoryTrendData[]> => {
    try {
      const inventory = await dashboardService.getLocationInventory(locationId)

      // For now, return current inventory value distributed over months
      // In a real scenario, this would come from historical data
      const totalValue = inventory.reduce((sum, item) => sum + item.value, 0)
      const trend: InventoryTrendData[] = []

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const baseValue = totalValue / months.length

      months.forEach((month, idx) => {
        // Simulate trend with some variance
        const variance = 0.8 + Math.random() * 0.4 // 80-120% of base value
        trend.push({
          month,
          value: Math.round(baseValue * variance),
          items: Math.round(inventory.length * variance * 0.5),
        })
      })

      return trend
    } catch (error) {
      console.error('Failed to fetch inventory trend:', error)
      return []
    }
  },

  // Get sales analytics for location
  getLocationSalesAnalytics: async (locationId: number) => {
    try {
      const response = await salesService.getSalesAnalytics(locationId)
      return response.data || null
    } catch (error) {
      console.error('Failed to fetch sales analytics:', error)
      return null
    }
  },

  // Get forecasting results
  getForecasts: async (locationId: number) => {
    try {
      const response = await forecastingService.getForecasts()
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch forecasts:', error)
      return []
    }
  },

  // Get recent stock movements
  getRecentTransactions: async (locationId: number) => {
    try {
      const salesResponse = await salesService.getSalesByLocation(locationId, 0, 10)
      return (
        salesResponse.data
          ?.slice(0, 5)
          .map((sale: any) => ({
            type: 'sold',
            itemName: sale.item?.item_Name || 'Unknown Item',
            quantity: sale.quantity || 0,
            value: (sale.quantity || 0) * (sale.unit_Price || 0),
            date: new Date(sale.sale_Date).toLocaleDateString(),
          })) || []
      )
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error)
      return []
    }
  },
}
