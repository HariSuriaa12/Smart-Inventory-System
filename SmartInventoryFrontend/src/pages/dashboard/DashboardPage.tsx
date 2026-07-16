import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { Card, Badge } from '@/components'
import { useLocationModal } from '@/context/LocationModalContext'
import { dashboardService, DashboardStats, DashboardAlert, LocationInventoryData } from '@/services/dashboardService'
import {
  Package,
  MapPin,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Loader,
  Eye,
} from 'lucide-react'

export const DashboardPage = () => {
  const { openLocationModal } = useLocationModal()
  const { currentLocation } = useAppSelector((state) => state.locations)

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [inventory, setInventory] = useState<LocationInventoryData[]>([])
  const [forecasts, setForecasts] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
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
      openLocationModal()
      return
    }

    const fetchLocationData = async () => {
      setLoading(true)
      try {
        const [alertsData, inventoryData, forecastsData, salesData] = await Promise.all([
          dashboardService.getLocationAlerts(currentLocation.id),
          dashboardService.getLocationInventory(currentLocation.id),
          dashboardService.getForecasts(currentLocation.id),
          dashboardService.getLocationSalesData(currentLocation.id),
        ])

        setAlerts(alertsData)
        setInventory(inventoryData)
        setForecasts(forecastsData)
        setSalesData(salesData)
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

  const maxSales = Math.max(...salesData.map((d) => Math.max(d.sales, d.target)), 1)

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forecasts */}
          <div className="lg:col-span-2">
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Forecasted</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actual</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Accuracy</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecasts.map((forecast: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                            {forecast.item_Name || forecast.itemName || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">
                            {Math.round(forecast.forecasted_Value || forecast.forecastedValue || 0)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {Math.round(forecast.actual_Value || forecast.actualValue || 0)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                              {(forecast.accuracy || 85).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="info" size="sm">
                              {forecast.method_Name || forecast.methodName || 'ANN'}
                            </Badge>
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

        {/* Sales Analytics */}
        <Card title="Sales Analytics" subtitle="Monthly sales vs target" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-gray-400" size={32} />
            </div>
          ) : salesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <TrendingUp size={40} className="mb-3" />
              <p className="text-gray-600">No sales data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {salesData.map((data, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${data.sales.toLocaleString()} / ${data.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-primary-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary-600 h-full transition-all"
                        style={{ width: `${(data.sales / maxSales) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gray-400 h-full transition-all"
                        style={{ width: `${(data.target / maxSales) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Actual Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Target</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Top Inventory Items */}
        <Card title="Inventory at Current Location" subtitle={`Top items by value at ${currentLocation?.location_Name || 'selected location'}`} className="mt-6">
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
