import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchPOs } from '@/store/slices/purchaseOrderSlice'
import { DataGrid, Card, Column } from '@/components'
import { CreatePurchaseOrderModal } from '@/components/modals/CreatePurchaseOrderModal'
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderStatusLabel } from '@/types/purchaseorder'
import { Plus, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 10

const STATUS_BADGE_CLASSES: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Pending]: 'bg-blue-100 text-blue-800',
  [PurchaseOrderStatus.Confirmed]: 'bg-purple-100 text-purple-800',
  [PurchaseOrderStatus.PartiallyReceived]: 'bg-yellow-100 text-yellow-800',
  [PurchaseOrderStatus.Received]: 'bg-green-100 text-green-800',
  [PurchaseOrderStatus.Cancelled]: 'bg-red-100 text-red-800',
}

export const PurchaseOrderListPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { orders, loading, total } = useAppSelector((state) => state.purchaseOrders)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      dispatch(fetchPOs({ skip: 0, take: PAGE_SIZE }) as any)
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchInput, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchPOs({ skip, take: PAGE_SIZE }) as any)
  }, [currentPage, dispatch])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
  }, [])

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false)
    dispatch(fetchPOs({ skip: 0, take: PAGE_SIZE }) as any)
    setCurrentPage(1)
  }, [dispatch])

  const handleRowDoubleClick = useCallback((po: PurchaseOrder) => {
    navigate(`/app/purchase-orders/${po.id}`)
  }, [navigate])

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'PO_Reference_No',
      label: 'PO Reference',
      width: '150px',
    },
    {
      key: 'Vendor_Id',
      label: 'Vendor',
      width: '150px',
      render: (_, po) => po.Vendor?.vendor_Name || '-',
    },
    {
      key: 'Location_Id',
      label: 'Location',
      width: '150px',
      render: (_, po) => po.Location?.location_Name || '-',
    },
    {
      key: 'Purchase_Date',
      label: 'Purchase Date',
      width: '130px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'Total_Amount',
      label: 'Total Amount',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'Status',
      label: 'Status',
      width: '140px',
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
          <p className="text-gray-600">Manage your purchase orders and track deliveries</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Create PO
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex-shrink-0 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO reference, vendor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {Object.entries(PurchaseOrderStatusLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Grid Card */}
      <Card className="flex-1 flex flex-col overflow-hidden p-6">
        <DataGrid<PurchaseOrder>
          columns={columns}
          data={orders}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No purchase orders found"
        />
      </Card>

      {/* Create PO Modal */}
      <CreatePurchaseOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        isLoading={loading}
      />
    </div>
  )
}
