import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, DataGrid, Column } from '@/components'
import { orderFulfillmentService } from '@/services/orderFulfillmentService'
import { OrderFulfillment, OrderFulfillmentItem, OrderFulfillmentStatus, OrderFulfillmentStatusLabel } from '@/types/orderfulfillment'
import { ArrowLeft, Check, X, RotateCcw, Package } from 'lucide-react'

const STATUS_BADGE_CLASSES: Record<OrderFulfillmentStatus, string> = {
  [OrderFulfillmentStatus.Unassigned]: 'bg-red-100 text-red-800',
  [OrderFulfillmentStatus.OnHold]: 'bg-gray-100 text-gray-800',
  [OrderFulfillmentStatus.PartiallyFulfilled]: 'bg-yellow-100 text-yellow-800',
  [OrderFulfillmentStatus.Fulfilled]: 'bg-green-100 text-green-800',
  [OrderFulfillmentStatus.Cancelled]: 'bg-red-100 text-red-800',
  [OrderFulfillmentStatus.Verified]: 'bg-blue-100 text-blue-800',
}

export const OrderFulfillmentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderFulfillment | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await orderFulfillmentService.getOrderFulfillmentById(Number(id))
      setOrder(response.data)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndAssign = useCallback(async () => {
    if (!id || !selectedLocationId) {
      alert('Please select a location')
      return
    }
    setActionLoading(true)
    try {
      const response = await orderFulfillmentService.verifyAndAssign(Number(id), Number(selectedLocationId))
      setOrder(response.data)
    } catch (error) {
      console.error('Failed to verify and assign:', error)
      alert('Failed to verify and assign order')
    } finally {
      setActionLoading(false)
    }
  }, [id, selectedLocationId])

  const handleShipItem = useCallback(
    async (itemId: number) => {
      const quantity = prompt('Enter shipped quantity:')
      if (!quantity || !id) return
      setActionLoading(true)
      try {
        const response = await orderFulfillmentService.shipItem(Number(id), itemId, parseFloat(quantity))
        setOrder(response.data)
      } catch (error) {
        console.error('Failed to ship item:', error)
        alert('Failed to ship item')
      } finally {
        setActionLoading(false)
      }
    },
    [id]
  )

  const handleCancelItem = useCallback(
    async (itemId: number) => {
      if (!id || !window.confirm('Are you sure you want to cancel this item?')) return
      setActionLoading(true)
      try {
        const response = await orderFulfillmentService.cancelItem(Number(id), itemId)
        setOrder(response.data)
      } catch (error) {
        console.error('Failed to cancel item:', error)
        alert('Failed to cancel item')
      } finally {
        setActionLoading(false)
      }
    },
    [id]
  )

  const handleCancelItemWithReturn = useCallback(
    async (itemId: number) => {
      if (!id || !window.confirm('Are you sure you want to cancel this item with return?')) return
      setActionLoading(true)
      try {
        const response = await orderFulfillmentService.cancelItemWithReturn(Number(id), itemId)
        setOrder(response.data)
      } catch (error) {
        console.error('Failed to cancel item with return:', error)
        alert('Failed to cancel item with return')
      } finally {
        setActionLoading(false)
      }
    },
    [id]
  )

  if (loading && !order) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/app/order-fulfillment')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Order Fulfillments
        </button>
        <Card className="p-6 text-center">
          <p className="text-gray-500">Order fulfillment not found</p>
        </Card>
      </div>
    )
  }

  const isUnassigned = order.status === OrderFulfillmentStatus.Unassigned
  const canShip = order.status !== OrderFulfillmentStatus.Unassigned && order.status !== OrderFulfillmentStatus.Cancelled

  const itemColumns: Column<OrderFulfillmentItem>[] = [
    {
      key: 'item_Code',
      label: 'Item Code',
      width: '120px',
      render: (value) => value || '-',
    },
    {
      key: 'item_Name',
      label: 'Item Name',
      width: '200px',
      render: (value) => value || '-',
    },
    {
      key: 'item_Category',
      label: 'Category',
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'unit_Of_Measure',
      label: 'UOM',
      width: '100px',
      render: (value) => value || '-',
    },
    {
      key: 'request_Quantity',
      label: 'Request Qty',
      width: '120px',
      align: 'right',
    },
    {
      key: 'shipped_Quantity',
      label: 'Shipped Qty',
      width: '120px',
      align: 'right',
    },
    {
      key: 'unit_Price',
      label: 'Unit Price',
      width: '110px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'sub_Total',
      label: 'Sub Total',
      width: '110px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (value: OrderFulfillmentStatus) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value]}`}>
          {OrderFulfillmentStatusLabel[value]}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      render: (_, item) => (
        <div className="flex gap-2">
          {canShip && item.status !== OrderFulfillmentStatus.Cancelled && (
            <button
              onClick={() => handleShipItem(item.id)}
              disabled={actionLoading}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
              title="Ship item"
            >
              <Check size={16} />
            </button>
          )}
          {(item.status === OrderFulfillmentStatus.PartiallyFulfilled || item.status === OrderFulfillmentStatus.Fulfilled) && (
            <>
              <button
                onClick={() => handleCancelItem(item.id)}
                disabled={actionLoading}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                title="Cancel item"
              >
                <X size={16} />
              </button>
              <button
                onClick={() => handleCancelItemWithReturn(item.id)}
                disabled={actionLoading}
                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                title="Cancel with return"
              >
                <RotateCcw size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/order-fulfillment')}
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Fulfillment #{order.id}</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGE_CLASSES[order.status]}`}>
                {OrderFulfillmentStatusLabel[order.status]}
              </span>
              <p className="text-gray-600">{new Date(order.order_Date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        {isUnassigned && (
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Location</label>
              <input
                type="number"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                placeholder="Enter Location ID"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleVerifyAndAssign}
              disabled={actionLoading || !selectedLocationId}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Check size={18} />
              Verify & Assign
            </button>
          </div>
        )}
      </div>

      {/* Order Details Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Customer</p>
          <p className="text-lg font-semibold text-gray-900">{order.customer_Name || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Location</p>
          <p className="text-lg font-semibold text-gray-900">{order.location_Name || (isUnassigned ? 'Not Assigned' : '-')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-lg font-semibold text-gray-900">${Number(order.total_Amount).toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Shipment City</p>
          <p className="text-lg font-semibold text-gray-900">{order.shipment_City || '-'}</p>
        </Card>
      </div>

      {/* Remark Section */}
      {order.remark && (
        <Card className="p-4 bg-blue-50 border border-blue-200 flex-shrink-0">
          <p className="text-sm text-gray-600 mb-2">Remark</p>
          <p className="text-gray-900">{order.remark}</p>
        </Card>
      )}

      {/* Items Table */}
      <Card className="flex flex-col overflow-hidden p-6" style={{ height: '400px' }}>
        <div className="mb-4 flex items-center gap-2 flex-shrink-0">
          <Package size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DataGrid<OrderFulfillmentItem>
            columns={itemColumns}
            data={order.items || []}
            loading={false}
            rowKey="id"
            emptyMessage="No items in this order"
          />
        </div>
      </Card>
    </div>
  )
}
