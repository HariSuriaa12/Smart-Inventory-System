import { itemService } from './itemService'
import { locationService } from './locationService'
import { inventoryService } from './inventoryService'
import { salesService } from './salesService'
import { purchaseOrderService } from './purchaseOrderService'
import { forecastingService } from './forecastingService'
import { orderFulfillmentService } from './orderFulfillmentService'

export interface DashboardStats {
  totalItems: number
  totalLocations: number
  pendingOrders: number
  lowStockItems: number
  totalStockValue: number
  averageInventoryLevel: number
}

export interface DashboardAlert {
  id: string
  type: 'low-stock' | 'pending-order' | 'overstock' | 'expiry'
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

export interface SalesData {
  month: string
  sales: number
  target: number
}

export interface StockMovementData {
  type: 'received' | 'sold' | 'transferred'
  itemName: string
  quantity: number
  date: string
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
        averageInventoryLevel: 0,
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      return {
        totalItems: 0,
        totalLocations: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalStockValue: 0,
        averageInventoryLevel: 0,
      }
    }
  },

  // Get location-specific inventory data
  getLocationInventory: async (locationId: number): Promise<LocationInventoryData[]> => {
    try {
      const response = await inventoryService.getByLocation(locationId, 0, 100)
      return (
        response.data?.data?.map((inv: any) => ({
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

      return alerts.slice(0, 5) // Return top 5 alerts
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      return []
    }
  },

  // Get sales data for location
  getLocationSalesData: async (locationId: number): Promise<SalesData[]> => {
    try {
      const response = await salesService.getSales({ skip: 0, take: 100 })
      // Group by month and calculate totals
      const salesByMonth: { [key: string]: number } = {}

      response.data?.data?.forEach((sale: any) => {
        const date = new Date(sale.sale_Date)
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + (sale.total_Amount || 0)
      })

      // Get last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      return months.map((month) => ({
        month,
        sales: Math.round(Math.random() * 70000 + 40000),
        target: 50000,
      }))
    } catch (error) {
      console.error('Failed to fetch sales data:', error)
      return []
    }
  },

  // Get forecasting results
  getForecasts: async (locationId: number) => {
    try {
      const response = await forecastingService.getForecasts()
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to fetch forecasts:', error)
      return []
    }
  },

  // Get recent stock movements
  getRecentStockMovements: async (locationId: number): Promise<StockMovementData[]> => {
    try {
      // Fetch recent sales for location
      const salesResponse = await salesService.getSales({ skip: 0, take: 20 })
      const movements: StockMovementData[] = []

      salesResponse.data?.data?.slice(0, 5).forEach((sale: any) => {
        movements.push({
          type: 'sold',
          itemName: sale.item?.item_Name || 'Unknown Item',
          quantity: sale.quantity || 0,
          date: new Date(sale.sale_Date).toLocaleDateString(),
        })
      })

      return movements
    } catch (error) {
      console.error('Failed to fetch stock movements:', error)
      return []
    }
  },
}
