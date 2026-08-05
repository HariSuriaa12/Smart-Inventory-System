import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { Card, Badge } from '@/components'
import { useLocationModal } from '@/context/LocationModalContext'
import { PreviewDownloadModal } from '@/components/modals/PreviewDownloadModal'
import { ExportDataModal } from '@/components/modals/ExportDataModal'
import {
  dashboardService,
  DashboardStats,
  DashboardAlert,
  LocationInventoryData,
  TopSellingItem,
  InventoryTrendData,
  ForecastedResultData_Py,
} from '@/services/dashboardService'
import { Package, MapPin, ShoppingCart, TrendingUp, AlertCircle, Loader, Eye, BarChart3, Download } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export const DashboardPage = () => {
  const { openLocationModal } = useLocationModal()
  const { currentLocation } = useAppSelector((state) => state.locations)

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [inventory, setInventory] = useState<LocationInventoryData[]>([])
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([])
  const [inventoryTrend, setInventoryTrend] = useState<InventoryTrendData[]>([])
  const [forecasts, setForecasts] = useState<ForecastedResultData_Py[]>([])
  const [loading, setLoading] = useState(true)
  const [showForecastModal, setShowForecastModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [timePeriod, setTimePeriod] = useState<'1m' | '3m' | '6m' | '1y'>('1m')

  // Fetch master stats on mount
  useEffect(() => {
    const fetchMasterStats = async () => {
      const data = await dashboardService.getStats()
      setStats(data)
    }

    fetchMasterStats()
  }, [])
  console.log('Current location:', currentLocation)
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
  }, [currentLocation]) /*[currentLocation, openLocationModal]*/

  useEffect(() => {
    if (forecasts.length > 0 && selectedItems.length === 0) {
      setSelectedItems([forecasts[0].ItemID])
    }
  }, [forecasts])

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
      value: `$${(inventory.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(0)}`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      description: 'Current location',
    },
  ]

  const maxTrendValue = Math.max(...inventoryTrend.map((d) => d.value), 1)

  const getConsumptionDataByPeriod = (period: '1m' | '3m' | '6m' | '1y') => {
    const periodMap = {
      '1m': 'QtyConsumption30Days',
      '3m': 'QtyConsumption30Days_M2',
      '6m': 'QtyConsumption30Days_M4',
      '1y': 'QtyConsumption30Days_Y1',
    }
    return periodMap[period] as keyof ForecastedResultData_Py
  }

  const prepareConsumptionChartData = () => {
    const filteredForecasts = forecasts.filter((f) => selectedItems.includes(f.ItemID))

    return filteredForecasts.map((f) => {
      const dataPoint: Record<string, number | string> = {
        name: f.ItemCode,
        itemId: f.ItemID,
      }

      if (timePeriod === '1y') {
        dataPoint['Year Ago'] = f.QtyConsumption30Days_Y1
        dataPoint['5 Months Ago'] = f.QtyConsumption30Days_M5
        dataPoint['4 Months Ago'] = f.QtyConsumption30Days_M4
        dataPoint['3 Months Ago'] = f.QtyConsumption30Days_M3
        dataPoint['2 Months Ago'] = f.QtyConsumption30Days_M2
        dataPoint['1 Month Ago'] = f.QtyConsumption30Days_M1
        dataPoint['Current Month'] = f.QtyConsumption30Days
        dataPoint['Forecasted'] = f.PredictedDemandNext30Days
      } else if (timePeriod === '6m') {
        dataPoint['4 Months Ago'] = f.QtyConsumption30Days_M4
        dataPoint['3 Months Ago'] = f.QtyConsumption30Days_M3
        dataPoint['2 Months Ago'] = f.QtyConsumption30Days_M2
        dataPoint['1 Month Ago'] = f.QtyConsumption30Days_M1
        dataPoint['Current Month'] = f.QtyConsumption30Days
        dataPoint['Forecasted'] = f.PredictedDemandNext30Days
      } else if (timePeriod === '3m') {
        dataPoint['2 Months Ago'] = f.QtyConsumption30Days_M2
        dataPoint['1 Month Ago'] = f.QtyConsumption30Days_M1
        dataPoint['Current Month'] = f.QtyConsumption30Days
        dataPoint['Forecasted'] = f.PredictedDemandNext30Days
      } else {
        dataPoint['Current Month'] = f.QtyConsumption30Days
        dataPoint['Forecasted'] = f.PredictedDemandNext30Days
      }

      return dataPoint as any
    })
  }

  const prepareForecastBarChartData = () => {
    return forecasts.map((f) => ({
      name: f.ItemCode,
      forecast: f.PredictedDemandNext30Days,
      itemId: f.ItemID,
      itemName: f.ItemName,
    }))
  }

  const uniqueItems = Array.from(new Map(forecasts.map((f) => [f.ItemID, f])).values()).map((f) => ({
    id: f.ItemID,
    code: f.ItemCode,
    name: f.ItemName,
  }))

  const getLineConfigs = () => {
    const lineColors = {
      'Year Ago': '#c4b5fd',
      '5 Months Ago': '#a5d6ff',
      '4 Months Ago': '#7dd3fc',
      '3 Months Ago': '#22d3ee',
      '2 Months Ago': '#4ade80',
      '1 Month Ago': '#60a5fa',
      'Current Month': '#10b981',
      'Forecasted': '#f59e0b',
    }

    const lines: Array<{ dataKey: string; color: string; strokeWidth: number; showDot?: boolean }> = []

    if (timePeriod === '1y') {
      lines.push(
        { dataKey: 'Year Ago', color: lineColors['Year Ago'], strokeWidth: 2 },
        { dataKey: '5 Months Ago', color: lineColors['5 Months Ago'], strokeWidth: 2 },
        { dataKey: '4 Months Ago', color: lineColors['4 Months Ago'], strokeWidth: 2 },
        { dataKey: '3 Months Ago', color: lineColors['3 Months Ago'], strokeWidth: 2 },
        { dataKey: '2 Months Ago', color: lineColors['2 Months Ago'], strokeWidth: 2 },
        { dataKey: '1 Month Ago', color: lineColors['1 Month Ago'], strokeWidth: 2 }
      )
    } else if (timePeriod === '6m') {
      lines.push(
        { dataKey: '4 Months Ago', color: lineColors['4 Months Ago'], strokeWidth: 2 },
        { dataKey: '3 Months Ago', color: lineColors['3 Months Ago'], strokeWidth: 2 },
        { dataKey: '2 Months Ago', color: lineColors['2 Months Ago'], strokeWidth: 2 },
        { dataKey: '1 Month Ago', color: lineColors['1 Month Ago'], strokeWidth: 2 }
      )
    } else if (timePeriod === '3m') {
      lines.push(
        { dataKey: '2 Months Ago', color: lineColors['2 Months Ago'], strokeWidth: 2 },
        { dataKey: '1 Month Ago', color: lineColors['1 Month Ago'], strokeWidth: 2 }
      )
    }

    lines.push(
      { dataKey: 'Current Month', color: lineColors['Current Month'], strokeWidth: 3, showDot: true },
      { dataKey: 'Forecasted', color: lineColors['Forecasted'], strokeWidth: 3, showDot: true }
    )

    return lines
  }

  return (
    <div className="relative min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              {currentLocation
                ? `Overview of your inventory system - ${currentLocation.location_Name}`
                : 'Select a location to view data'}
            </p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
          >
            <Download size={18} />
            Download Report
          </button>
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

        {/* Forecasted Results - Bar Chart */}
        <Card
          title="Forecasted Demand - Next 30 Days"
          subtitle="AI-powered demand forecasts by item for current location"
          className="mb-6"
        >
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
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
              <>
                {/* Bar Chart */}
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareForecastBarChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                        formatter={(value: any) => [Math.round(value), 'Forecasted Qty']}
                        labelFormatter={(label) => `Item: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="forecast" fill="#3b82f6" name="Forecasted Quantity (Next 30 Days)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Preview & Download Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowForecastModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2"
                  >
                    <Eye size={18} />
                    Preview & Download
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Historical Consumption Trend */}
        <Card
          title="Consumption Trend & Forecast"
          subtitle="Historical consumption patterns with forecast comparison"
          className="mb-6"
        >
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-gray-400" size={32} />
              </div>
            ) : forecasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <TrendingUp size={40} className="mb-3" />
                <p className="text-gray-600">No historical data available</p>
                <p className="text-sm text-gray-500 mt-1">
                  Historical trends will appear once enough data is collected
                </p>
              </div>
            ) : (
              <>
                {/* Improved Filter Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Item Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Select Items</label>
                      <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2 max-h-64 overflow-y-auto shadow-sm">
                        {uniqueItems.length === 0 ? (
                          <p className="text-sm text-gray-500">No items available</p>
                        ) : (
                          uniqueItems.map((item) => (
                            <label key={item.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, item.id])
                                  } else {
                                    setSelectedItems(selectedItems.filter((id) => id !== item.id))
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 flex-1">
                                <span className="font-medium">{item.code}</span>
                                <span className="text-gray-500 ml-1">({item.name})</span>
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                      </div>
                    </div>

                    {/* Time Period Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Time Period</label>
                      <div className="flex flex-col gap-2">
                        {[
                          { value: '1m', label: 'Past Month', description: 'Last 30 days' },
                          { value: '3m', label: 'Past 3 Months', description: 'Last 90 days' },
                          { value: '6m', label: 'Past 6 Months', description: 'Last 180 days' },
                          { value: '1y', label: 'Past Year', description: 'Last 365 days' },
                        ].map((period) => (
                          <label
                            key={period.value}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                              timePeriod === period.value
                                ? 'bg-blue-100 border border-blue-300'
                                : 'bg-white border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="period"
                              value={period.value}
                              checked={timePeriod === period.value}
                              onChange={(e) => setTimePeriod(e.target.value as '1m' | '3m' | '6m' | '1y')}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{period.label}</p>
                              <p className="text-xs text-gray-500">{period.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Info Box */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Chart Legend</label>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5 bg-gray-400"></div>
                          <span className="text-gray-700">Historical consumption data</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5 bg-amber-400"></div>
                          <span className="text-gray-700">Forecasted demand</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-gray-600">
                            Shows {timePeriod === '1y' ? 'all 12 months' : timePeriod === '6m' ? '6 months' : timePeriod === '3m' ? '3 months' : '1 month'} of data
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Chart */}
                {selectedItems.length > 0 ? (
                  <div className="w-full h-96 bg-white rounded-lg border border-gray-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareConsumptionChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#666" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value: any) => Math.round(value)}
                          labelStyle={{ color: '#111827' }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        {getLineConfigs().map((lineConfig) => (
                          <Line
                            key={lineConfig.dataKey}
                            type="monotone"
                            dataKey={lineConfig.dataKey}
                            stroke={lineConfig.color}
                            strokeWidth={lineConfig.strokeWidth}
                            dot={lineConfig.showDot ? { fill: lineConfig.color, r: 4 } : false}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <AlertCircle size={40} className="mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium">Select at least one item</p>
                    <p className="text-sm text-gray-500">Choose items from the filter panel to display the chart</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Preview Download Modal */}
        <PreviewDownloadModal
          isOpen={showForecastModal}
          onClose={() => setShowForecastModal(false)}
          title="Forecasted Results - Preview"
          data={forecasts.map((f) => ({
            'Item Code': f.ItemCode,
            'Item Name': f.ItemName,
            'Forecasted Qty': f.PredictedDemandNext30Days,
            'Method': f.Method === 0 ? 'ANN' : 'MA',
            'Model Version': '1.0',
            'Forecast Date': new Date(f.Date).toLocaleDateString(),
          }))}
          columns={[
            { key: 'Item Code', label: 'Item Code' },
            { key: 'Item Name', label: 'Item Name' },
            { key: 'Forecasted Qty', label: 'Forecasted Qty' },
            { key: 'Method', label: 'Method' },
            { key: 'Model Version', label: 'Model Version' },
            { key: 'Forecast Date', label: 'Forecast Date' },
          ]}
          filename="forecasted_results"
        />

        {/* Export Data Modal */}
        <ExportDataModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />

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
