import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { Card, Badge } from '@/components'
import { useLocationModal } from '@/context/LocationModalContext'
import {
  dashboardService,
  DashboardStats,
  DashboardAlert,
  LocationInventoryData,
  TopSellingItem,
  InventoryTrendData,
  ForecastedResult,
} from '@/services/dashboardService'
import { Package, MapPin, ShoppingCart, TrendingUp, AlertCircle, Loader, Eye, BarChart3 } from 'lucide-react'

export const DashboardPage = () => {
  const { openLocationModal } = useLocationModal()
  const { currentLocation } = useAppSelector((state) => state.locations)

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [inventory, setInventory] = useState<LocationInventoryData[]>([])
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([])
  const [inventoryTrend, setInventoryTrend] = useState<InventoryTrendData[]>([])
  const [forecasts, setForecasts] = useState<ForecastedResult[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch master stats on mount
  useEffect(() => {
    const fetchMasterStats = async () => {
      const data = await dashboardService.getStats()
      setStats(data)
    }

    fetchMasterStats()
  }, [])

  // Fetch location-specific data
  useEffect(() => {
    if (!currentLocation) {
      openLocationModal(true)
      return
    }

    const fetchLocationData = async () => {
      setLoading(true)
      try {
        const [alertsData, inventoryData, topSellingData, trendData, forecastsData] = await Promise.all([
          dashboardService.getLocationAlerts(currentLocation.id),
          dashboardService.getLocationInventory(currentLocation.id),
          dashboardService.getTopSellingItems(currentLocation.id),
          dashboardService.getInventoryTrend(currentLocation.id),
          dashboardService.getForecasts(currentLocation.id),
        ])
        console.log('Fetched dashboard data:', {
          alerts: alertsData,
          inventory: inventoryData,
          topSelling: topSellingData,
          trend: trendData,
          forecasts: forecastsData,
        })
        setAlerts(alertsData)
        setInventory(inventoryData)
        setTopSellingItems(topSellingData)
        setInventoryTrend(trendData)
        setForecasts(forecastsData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [currentLocation, openLocationModal])

  const statCards = [
    {
      title: 'Total Items',
      value: stats?.totalItems.toLocaleString() || '0',
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      description: 'Master items',
    },
    {
      title: 'Total Locations',
      value: stats?.totalLocations.toString() || '0',
      icon: MapPin,
      color: 'bg-green-100 text-green-600',
      description: 'Warehouses',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-orange-100 text-orange-600',
      description: 'Purchase orders',
    },
    {
      title: 'Stock Value',
      value: `$${(inventory.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      description: 'Current location',
    },
  ]

  const maxTrendValue = Math.max(...inventoryTrend.map((d) => d.value), 1)

  return (
    <div className="relative min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            {currentLocation
              ? `Overview of your inventory system - ${currentLocation.location_Name}`
              : 'Select a location to view data'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => {
            const IconComponent = stat.icon
            return (
              <Card key={idx}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <IconComponent size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-2">{stat.description}</p>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Selling Items */}
          <div className="lg:col-span-2">
            <Card title="Top Selling Items" subtitle="Best performing products">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin text-gray-400" size={32} />
                </div>
              ) : topSellingItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <BarChart3 size={40} className="mb-3" />
                  <p className="text-gray-600">No sales data available yet</p>
                  <p className="text-sm text-gray-500 mt-1">Top items will appear as sales are recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty Sold</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Price</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSellingItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                            <div>
                              <p className="font-semibold">{item.itemName}</p>
                              <p className="text-xs text-gray-500">{item.itemCode}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">
                            {item.totalQty.toFixed(0)} units
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            ${item.averagePrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                            ${item.totalValue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Alerts */}
          <div>
            <Card title="Alerts" subtitle="Recent alerts & warnings">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin text-gray-400" size={24} />
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <AlertCircle size={32} className="mb-2 text-green-400" />
                  <p className="text-sm text-gray-600">No alerts</p>
                  <p className="text-xs text-gray-500 mt-1">Everything looks good!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.severity === 'error'
                          ? 'bg-red-50 border-red-200'
                          : alert.severity === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            alert.severity === 'error'
                              ? 'bg-red-500'
                              : alert.severity === 'warning'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                          }`}
                        ></div>
                        <p
                          className={`text-sm ${
                            alert.severity === 'error'
                              ? 'text-red-800'
                              : alert.severity === 'warning'
                                ? 'text-yellow-800'
                                : 'text-blue-800'
                          }`}
                        >
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Inventory Value Trend */}
        <Card title="Inventory Value Trend" subtitle="Monthly inventory value at current location" className="mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-gray-400" size={32} />
            </div>
          ) : inventoryTrend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <TrendingUp size={40} className="mb-3" />
              <p className="text-gray-600">No trend data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inventoryTrend.map((data, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${data.value.toLocaleString()} ({data.items} items)
                    </span>
                  </div>
                  <div className="bg-primary-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full transition-all"
                      style={{ width: `${(data.value / maxTrendValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Forecasting Results */}
        <Card title="Forecasted Results" subtitle="AI-powered demand forecasts">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin text-gray-400" size={32} />
            </div>
          ) : forecasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Eye size={40} className="mb-3" />
              <p className="text-gray-600">No forecast data available</p>
              <p className="text-sm text-gray-500 mt-1">
                Forecasts will appear once enough historical data is collected
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Name</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Forecasted Qty</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Model</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Forecast Date</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((forecast, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{forecast.itemCode}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{forecast.itemName}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">
                        {Math.round(forecast.forecastedQuantity)} units
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="info" size="sm">
                          {forecast.forecastMethod === 0 ? 'ANN' : 'MA'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        v{forecast.modelVersion}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(forecast.creationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Top Inventory Items */}
        <Card title="Current Inventory" subtitle={`Top items by value at ${currentLocation?.location_Name || 'selected location'}`} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin text-gray-400" size={32} />
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Package size={40} className="mb-3" />
              <p className="text-gray-600">No inventory data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Name</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">On Hand</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Available</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10)
                    .map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.itemCode}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.itemName}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">
                          {item.onHandQty.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">
                          {item.availableQty.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                          ${item.value.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
