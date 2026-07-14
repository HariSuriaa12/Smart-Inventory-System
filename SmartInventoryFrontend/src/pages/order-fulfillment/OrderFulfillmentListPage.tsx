import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, DataGrid, Column, Input } from '@/components'
import { orderFulfillmentService } from '@/services/orderFulfillmentService'
import { OrderFulfillment, OrderFulfillmentStatus, OrderFulfillmentStatusLabel } from '@/types/orderfulfillment'
import { Plus, Search } from 'lucide-react'

const STATUS_BADGE_CLASSES: Record<OrderFulfillmentStatus, string> = {
  [OrderFulfillmentStatus.Unassigned]: 'bg-red-100 text-red-800',
  [OrderFulfillmentStatus.OnHold]: 'bg-gray-100 text-gray-800',
  [OrderFulfillmentStatus.PartiallyFulfilled]: 'bg-yellow-100 text-yellow-800',
  [OrderFulfillmentStatus.Fulfilled]: 'bg-green-100 text-green-800',
  [OrderFulfillmentStatus.Cancelled]: 'bg-red-100 text-red-800',
  [OrderFulfillmentStatus.Verified]: 'bg-blue-100 text-blue-800',
}

const AVAILABLE_COLUMNS = [
  { id: 'id', label: 'ID', width: '80px' },
  { id: 'customer_Name', label: 'Customer', width: '180px' },
  { id: 'location_Name', label: 'Location', width: '150px' },
  { id: 'order_Date', label: 'Order Date', width: '120px' },
  { id: 'status', label: 'Status', width: '140px' },
  { id: 'total_Amount', label: 'Total Amount', width: '130px' },
]

export const OrderFulfillmentListPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderFulfillment[]>([])
  const [loading, setLoading] = useState(false)
  const [skip, setSkip] = useState(0)
  const [take, setTake] = useState(10)
  const [total, setTotal] = useState(0)

  const [filters, setFilters] = useState({
    fulfillmentId: '',
    customerId: '',
    unprocessedOnly: false,
  })

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'id',
    'customer_Name',
    'location_Name',
    'order_Date',
    'status',
    'total_Amount',
  ])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const filterParams: any = {}

      if (filters.fulfillmentId) {
        filterParams.fulfillmentId = parseInt(filters.fulfillmentId)
      }
      if (filters.customerId) {
        filterParams.customerId = parseInt(filters.customerId)
      }
      if (filters.unprocessedOnly) {
        filterParams.unprocessedOnly = true
      }

      const response = await orderFulfillmentService.getAllOrderFulfillments(skip, take, filterParams)
      setOrders(response.data || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }, [skip, take, filters])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) => (prev.includes(columnId) ? prev.filter((c) => c !== columnId) : [...prev, columnId]))
  }

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setSkip(0)
  }

  const handleRowDoubleClick = useCallback(
    (order: OrderFulfillment) => {
      navigate(`/app/order-fulfillment/${order.id}`)
    },
    [navigate]
  )

  const columns: Column<OrderFulfillment>[] = AVAILABLE_COLUMNS.filter((col) => selectedColumns.includes(col.id)).map((col) => {
    if (col.id === 'status') {
      return {
        key: 'status',
        label: col.label,
        width: col.width,
        render: (value: OrderFulfillmentStatus) => (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value]}`}>
            {OrderFulfillmentStatusLabel[value]}
          </span>
        ),
      }
    }
    if (col.id === 'order_Date') {
      return {
        key: 'order_Date',
        label: col.label,
        width: col.width,
        render: (value) => new Date(value).toLocaleDateString(),
      }
    }
    if (col.id === 'total_Amount') {
      return {
        key: 'total_Amount',
        label: col.label,
        width: col.width,
        align: 'right',
        render: (value) => `$${Number(value).toFixed(2)}`,
      }
    }
    return {
      key: col.id as keyof OrderFulfillment,
      label: col.label,
      width: col.width,
      render: (value) => value || '-',
    }
  })

  const totalPages = Math.ceil(total / take)
  const currentPage = Math.floor(skip / take) + 1

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Order Fulfillments</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
          <Plus size={18} />
          New Order
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex-shrink-0">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment ID</label>
              <Input
                type="text"
                placeholder="Search by ID"
                value={filters.fulfillmentId}
                onChange={(e) => handleFilterChange('fulfillmentId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <Input
                type="text"
                placeholder="Search by Customer"
                value={filters.customerId}
                onChange={(e) => handleFilterChange('customerId', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.unprocessedOnly}
                  onChange={(e) => handleFilterChange('unprocessedOnly', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Unprocessed Only</span>
              </label>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => loadOrders()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Column Selection */}
      <Card className="p-4 flex-shrink-0">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Select Columns</p>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_COLUMNS.map((col) => (
              <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col.id)}
                  onChange={() => handleColumnToggle(col.id)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* Data Grid */}
      <Card className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Orders ({total})</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DataGrid<OrderFulfillment>
            columns={columns}
            data={orders}
            loading={loading}
            onRowDoubleClick={handleRowDoubleClick}
            rowKey="id"
            emptyMessage="No order fulfillments found"
            rowHint="Double-click to view details"
          />
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between border-t pt-4 flex-shrink-0">
          <div className="text-sm text-gray-600">
            Showing {skip + 1} to {Math.min(skip + take, total)} of {total} orders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSkip(Math.max(0, skip - take))}
              disabled={skip === 0}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
            <button
              onClick={() => setSkip(skip + take)}
              disabled={skip + take >= total}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
