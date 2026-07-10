import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Card, Spinner, Badge } from '@/components'
import { fetchAllLocations, selectLocation, setCurrentLocation } from '@/store/slices/locationSlice'
import { Location } from '@/types/location';
import {
  Package,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

export const DashboardPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useAppDispatch()
  const { 
    locations,
    currentLocation,
    loading,
    error,
    total
        } = useAppSelector((state) => state.locations)

  useEffect(() => {
    dispatch(fetchAllLocations())
  }, [dispatch])

const handleSelectLocation = (location: Location) => {
  console.log('Selected location:', location);
  dispatch(setCurrentLocation(location)); 
};

  // Sample data - in production, fetch from API
  const stats = [
    {
      title: 'Total Items',
      value: '2,450',
      change: '+12.5%',
      isPositive: true,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Locations',
      value: '18',
      change: '+2.3%',
      isPositive: true,
      icon: MapPin,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pending Orders',
      value: '47',
      change: '-8.2%',
      isPositive: false,
      icon: ShoppingCart,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Total Stock Value',
      value: '$245,680',
      change: '+15.2%',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  // Sample forecast data
  const forecasts = [
    {
      itemName: 'SKU-001: Widget A',
      location: 'Location 1',
      forecasted: 450,
      actual: 380,
      method: 'ANN',
      accuracy: 94.2,
      trend: 'up',
    },
    {
      itemName: 'SKU-002: Widget B',
      location: 'Location 2',
      forecasted: 280,
      actual: 295,
      method: 'MA',
      accuracy: 87.5,
      trend: 'down',
    },
    {
      itemName: 'SKU-003: Gadget X',
      location: 'Location 1',
      forecasted: 620,
      actual: 598,
      method: 'ANN',
      accuracy: 96.1,
      trend: 'up',
    },
  ]

  // Sample sales data
  const salesData = [
    { month: 'Jan', sales: 45000, target: 50000 },
    { month: 'Feb', sales: 52000, target: 50000 },
    { month: 'Mar', sales: 48000, target: 50000 },
    { month: 'Apr', sales: 61000, target: 50000 },
    { month: 'May', sales: 55000, target: 50000 },
    { month: 'Jun', sales: 67000, target: 50000 },
  ]

  // Sample inventory alerts
  const inventoryAlerts = [
    {
      id: 1,
      type: 'low-stock',
      message: 'SKU-001 inventory is below threshold',
      severity: 'warning',
    },
    {
      id: 2,
      type: 'overstock',
      message: 'Location 3 has excess inventory of SKU-045',
      severity: 'info',
    },
    {
      id: 3,
      type: 'expiry',
      message: 'SKU-089 expires in 5 days',
      severity: 'error',
    },
  ]

  const maxSales = Math.max(...salesData.map((d) => Math.max(d.sales, d.target)))

  return (
  <div className="relative min-h-screen">
    {/* Main Dashboard Content */}
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your inventory system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon
          return (
            <Card key={idx}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <IconComponent size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecasting Results */}
        <div className="lg:col-span-2">
          <Card title="Forecasted Results" subtitle="Latest demand forecasts">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Forecasted</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actual</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Accuracy</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((forecast, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{forecast.itemName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{forecast.location}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">{forecast.forecasted}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">{forecast.actual}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                          {forecast.accuracy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="info" size="sm">{forecast.method}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Inventory Alerts */}
        <div>
          <Card title="Alerts" subtitle="Inventory & system alerts">
            <div className="space-y-3">
              {inventoryAlerts.map((alert) => (
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
                        alert.severity === 'error' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                    ></div>
                    <p className={`text-sm ${alert.severity === 'error' ? 'text-red-800' : alert.severity === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Sales Analytics */}
      <Card title="Sales Analytics" subtitle="Monthly sales vs target" className="mt-6">
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
                  <div className="bg-primary-600 h-full transition-all" style={{ width: `${(data.sales / maxSales) * 100}%` }}></div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gray-400 h-full transition-all" style={{ width: `${(data.target / maxSales) * 100}%` }}></div>
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
      </Card>
    </div>

    {/* Location Selection Modal Overlay */}
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md px-4">
        {/* Modal Card */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-white" size={28} />
              <h2 className="text-2xl font-bold text-white">Select Location</h2>
            </div>
            <p className="text-primary-100 text-sm">Choose a location to access your dashboard</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" className="mb-4" />
                <p className="text-gray-600 text-sm">Loading locations...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700 text-sm font-medium">Failed to load locations</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No locations found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {locations.map((loc) => (
                  <button
                    key={loc.outletCode}
                    onClick={() => {
                      handleSelectLocation(loc);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {loc.locationName}
                      </h3>
                      <Badge variant="outline" size="sm" className="text-gray-600 group-hover:text-primary-600">
                        {loc.outletCode}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700">{loc.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)
}
