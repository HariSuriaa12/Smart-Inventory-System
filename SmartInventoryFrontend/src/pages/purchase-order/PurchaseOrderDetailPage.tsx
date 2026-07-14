import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchPOById, updatePO } from '@/store/slices/purchaseOrderSlice'
import { Card, DataGrid, Column } from '@/components'
import { EditPurchaseOrderModal } from '@/components/modals/EditPurchaseOrderModal'
import { AddPurchaseOrderItemModal } from '@/components/modals/AddPurchaseOrderItemModal'
import { ReceivePurchaseOrderModal } from '@/components/modals/ReceivePurchaseOrderModal'
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus, PurchaseOrderStatusLabel } from '@/types/purchaseorder'
import { ArrowLeft, Edit2, Plus, Package, Check, X } from 'lucide-react'
import { purchaseOrderService } from '@/services/purchaseOrderService'

const STATUS_BADGE_CLASSES: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Pending]: 'bg-blue-100 text-blue-800',
  [PurchaseOrderStatus.Confirmed]: 'bg-purple-100 text-purple-800',
  [PurchaseOrderStatus.PartiallyReceived]: 'bg-yellow-100 text-yellow-800',
  [PurchaseOrderStatus.Received]: 'bg-green-100 text-green-800',
  [PurchaseOrderStatus.Cancelled]: 'bg-red-100 text-red-800',
}

export const PurchaseOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PurchaseOrderItem | null>(null)

  const { currentOrder, loading } = useAppSelector((state) => state.purchaseOrders)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchPOById(Number(id)) as any)
    }
  }, [id, dispatch])

  const handleConfirm = useCallback(async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await purchaseOrderService.confirmPurchaseOrder(Number(id))
      dispatch(fetchPOById(Number(id)) as any)
    } catch (error) {
      console.error('Failed to confirm purchase order:', error)
    } finally {
      setActionLoading(false)
    }
  }, [id, dispatch])

  const handleCancel = useCallback(async () => {
    if (!id || !window.confirm('Are you sure you want to cancel this purchase order?')) return
    setActionLoading(true)
    try {
      await purchaseOrderService.cancelPurchaseOrder(Number(id))
      dispatch(fetchPOById(Number(id)) as any)
    } catch (error) {
      console.error('Failed to cancel purchase order:', error)
    } finally {
      setActionLoading(false)
    }
  }, [id, dispatch])

  const handleEditSuccess = useCallback(() => {
    setIsEditOpen(false)
    if (id) {
      dispatch(fetchPOById(Number(id)) as any)
    }
  }, [id, dispatch])

  const handleAddItemSuccess = useCallback(() => {
    setIsAddItemOpen(false)
    if (id) {
      dispatch(fetchPOById(Number(id)) as any)
    }
  }, [id, dispatch])

  const handleReceiveSuccess = useCallback(() => {
    setIsReceiveOpen(false)
    setSelectedItem(null)
    if (id) {
      dispatch(fetchPOById(Number(id)) as any)
    }
  }, [id, dispatch])

  const handleRowDoubleClick = useCallback((item: PurchaseOrderItem) => {
    setSelectedItem(item)
    setIsReceiveOpen(true)
  }, [])

  if (loading && !currentOrder) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/app/purchase-orders')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Purchase Orders
        </button>
        <Card className="p-6 text-center">
          <p className="text-gray-500">Purchase order not found</p>
        </Card>
      </div>
    )
  }

  const isEditable = currentOrder.status === PurchaseOrderStatus.Pending
  const canAddItems = currentOrder.status === PurchaseOrderStatus.Pending

  const itemColumns: Column<PurchaseOrderItem>[] = [
    {
      key: 'item_Code',
      label: 'Item Code',
      width: '120px',
      //render: (_, item) => item.item?.item_Code || '-',
      render: (value) => value || '-',
    },
    {
      key: 'item_Name',
      label: 'Item Name',
      width: '200px',
      //render: (_, item) => item.item?.item_Name || '-',
      render: (value) => value || '-',
    },
    {
      key: 'item_Category',
      label: 'Item Category',
      width: '150px',
      //render: (_, item) => item.item?.item_Category || '-',
      render: (value) => value || '-',
    },
    {
      key: 'unit_Of_Measure',
      label: 'Unit of Measure',
      width: '150px',
      //render: (_, item) => item.item?.unit_Of_Measure || '-',
      render: (value) => value || '-',
    },
    {
      key: 'order_Quantity',
      label: 'Order Qty',
      width: '110px',
      align: 'right',
    },
    {
      key: 'received_Quantity',
      label: 'Received Qty',
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
      render: (value: PurchaseOrderStatus) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value]}`}>
          {PurchaseOrderStatusLabel[value]}
        </span>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/purchase-orders')}
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Order {currentOrder.pO_Reference_No}</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGE_CLASSES[currentOrder.status]}`}>
                {PurchaseOrderStatusLabel[currentOrder.status]}
              </span>
              <p className="text-gray-600">
                {new Date(currentOrder.purchase_Date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditable && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={actionLoading}
            >
              <Edit2 size={18} />
              Edit
            </button>
          )}
          {canAddItems && (
            <button
              onClick={() => setIsAddItemOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              disabled={actionLoading}
            >
              <Plus size={18} />
              Add Item
            </button>
          )}
          {currentOrder.status === PurchaseOrderStatus.Pending && (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={actionLoading}
            >
              <Check size={18} />
              Confirm
            </button>
          )}
          {(currentOrder.status === PurchaseOrderStatus.Pending || currentOrder.status === PurchaseOrderStatus.Confirmed || currentOrder.status === PurchaseOrderStatus.PartiallyReceived) && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={actionLoading}
            >
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* PO Details Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Vendor</p>
          <p className="text-lg font-semibold text-gray-900">{currentOrder.vendor_Name || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">PO Reference No</p>
          <p className="text-lg font-semibold text-gray-900">{currentOrder.pO_Reference_No || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-lg font-semibold text-gray-900">${Number(currentOrder.total_Amount).toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Created By</p>
          <p className="text-lg font-semibold text-gray-900">{currentOrder.user_Full_Name || '-'}</p>
        </Card>
      </div>

      {/* Remark Section */}
      {currentOrder.remark && (
        <Card className="p-4 bg-blue-50 border border-blue-200 flex-shrink-0">
          <p className="text-sm text-gray-600 mb-2">Remark</p>
          <p className="text-gray-900">{currentOrder.remark}</p>
        </Card>
      )}

      {/* Items Table */}
      <Card className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="mb-4 flex items-center gap-2">
          <Package size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        </div>
        <DataGrid<PurchaseOrderItem>
          columns={itemColumns}
          data={currentOrder.items || []}
          loading={false}
          onRowDoubleClick={currentOrder.status !== PurchaseOrderStatus.Pending ? handleRowDoubleClick : undefined}
          rowKey="id"
          emptyMessage="No items in this purchase order"
          rowHint={currentOrder.status !== PurchaseOrderStatus.Pending ? 'Double-click to receive item' : undefined}
        />
      </Card>

      {/* Edit PO Modal */}
      <EditPurchaseOrderModal
        isOpen={isEditOpen}
        po={currentOrder}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
        isLoading={loading}
      />

      {/* Add Item Modal */}
      {canAddItems && (
        <AddPurchaseOrderItemModal
          isOpen={isAddItemOpen}
          poId={currentOrder.id}
          onClose={() => setIsAddItemOpen(false)}
          onSuccess={handleAddItemSuccess}
          isLoading={loading}
        />
      )}

      {/* Receive Item Modal */}
      {currentOrder.status !== PurchaseOrderStatus.Pending && selectedItem && (
        <ReceivePurchaseOrderModal
          isOpen={isReceiveOpen}
          poId={currentOrder.id}
          item={selectedItem}
          onClose={() => {
            setIsReceiveOpen(false)
            setSelectedItem(null)
          }}
          onSuccess={handleReceiveSuccess}
          isLoading={loading}
        />
      )}
    </div>
  )
}
