import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchPOs } from '@/store/slices/purchaseOrderSlice'
import { DataGrid, Card, Column } from '@/components'
import { CreatePurchaseOrderModal } from '@/components/modals/CreatePurchaseOrderModal'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderStatusLabel } from '@/types/purchaseorder'
import { Plus, Search, X, Columns3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 10

// Mandatory columns that users cannot remove
const MANDATORY_COLUMNS = [
  { key: 'id', label: 'PO ID' },
  { key: 'purchase_Date', label: 'Date' },
  { key: 'vendor_Code', label: 'Vendor Code' },
  { key: 'total_Amount', label: 'Total Amount' },
  { key: 'status', label: 'Status' },
]

// Optional columns that users can toggle
const OPTIONAL_COLUMNS = [
  { key: 'po_Refence_No', label: 'PO Reference' },
  { key: 'vendor_Name', label: 'Vendor Name' },
  { key: 'vendor_Email', label: 'Vendor Email' },
  { key: 'vendor_Phone', label: 'Vendor Phone' },
  { key: 'location_Name', label: 'Location Name' },
  { key: 'location_Address', label: 'Location Address' },
  { key: 'purchase_Time', label: 'Time' },
  { key: 'items_Count', label: 'Items Count' },
  { key: 'received_Count', label: 'Received Items' },
  { key: 'remark', label: 'Remarks' },
  { key: 'user_Full_Name', label: 'Created By' },
]

const STORAGE_KEY = 'po_visible_columns'

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
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
    return new Set()
  })

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

  const handleSaveVisibleColumns = useCallback((newVisibleColumns: Set<string>) => {
    setVisibleColumns(newVisibleColumns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newVisibleColumns)))
  }, [])

  const allColumnDefinitions: Record<string, Column<PurchaseOrder>> = useMemo(() => ({
    id: {
      key: 'id',
      label: 'PO ID',
      width: '80px',
    },
    po_Refence_No: {
      key: 'po_Refence_No',
      label: 'PO Reference',
      width: '150px',
    },
    purchase_Date: {
      key: 'purchase_Date',
      label: 'Date',
      width: '130px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    purchase_Time: {
      key: 'purchase_Time',
      label: 'Time',
      width: '100px',
      render: (value) => value ? new Date(`2000-01-01T${value}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    vendor_Code: {
      key: 'vendor_Code',
      label: 'Vendor Code',
      width: '120px',
      render: (value) => value || '-',
    },
    vendor_Name: {
      key: 'vendor_Name',
      label: 'Vendor Name',
      width: '150px',
      render: (value) => value || '-',
    },
    vendor_Email: {
      key: 'vendor_Email',
      label: 'Vendor Email',
      width: '180px',
      render: (_, po) => po.vendor?.email || '-',
    },
    vendor_Phone: {
      key: 'vendor_Phone',
      label: 'Vendor Phone',
      width: '130px',
      render: (_, po) => po.vendor?.phone_No || '-',
    },
    location_Name: {
      key: 'location_Name',
      label: 'Location Name',
      width: '150px',
      render: (value) => value || '-',
    },
    location_Address: {
      key: 'location_Address',
      label: 'Location Address',
      width: '200px',
      render: (_, po) => po.location?.address || '-',
    },
    total_Amount: {
      key: 'total_Amount',
      label: 'Total Amount',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    items_Count: {
      key: 'items_Count',
      label: 'Items Count',
      width: '120px',
      align: 'center',
      render: (_, po) => po.items?.length || 0,
    },
    received_Count: {
      key: 'received_Count',
      label: 'Received Items',
      width: '130px',
      align: 'center',
      render: (_, po) => po.items?.filter(i => i.received_Quantity > 0).length || 0,
    },
    status: {
      key: 'status',
      label: 'Status',
      width: '140px',
      render: (value: PurchaseOrderStatus) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value]}`}>
          {PurchaseOrderStatusLabel[value]}
        </span>
      ),
    },
    remark: {
      key: 'remark',
      label: 'Remarks',
      width: '200px',
      render: (value) => value ? (
        <span title={value} className="truncate inline-block max-w-[200px]">
          {value}
        </span>
      ) : '-',
    },
    user_Full_Name: {
      key: 'user_Full_Name',
      label: 'Created By',
      width: '150px',
      render: (value) => value || '-',
    },
  }), [])

  const columns = useMemo(() => {
    // Always include mandatory columns first
    const mandatoryCols = MANDATORY_COLUMNS
      .map(({ key }) => allColumnDefinitions[key])
      .filter(Boolean)

    // Then add selected optional columns
    const optionalCols = OPTIONAL_COLUMNS
      .filter(({ key }) => visibleColumns.has(key))
      .map(({ key }) => allColumnDefinitions[key])
      .filter(Boolean)

    return [...mandatoryCols, ...optionalCols]
  }, [visibleColumns, allColumnDefinitions])

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
      <div className="flex-shrink-0 flex gap-3">
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
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent whitespace-nowrap"
        >
          <option value="">All Status</option>
          {Object.entries(PurchaseOrderStatusLabel).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsColumnSelectorOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
          title="Select columns to display"
        >
          <Columns3 size={18} />
          <span className="text-sm font-medium">Columns</span>
        </button>
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

      {/* Column Selector Modal */}
      <ColumnSelectorModal
        isOpen={isColumnSelectorOpen}
        columns={OPTIONAL_COLUMNS}
        visibleColumns={visibleColumns}
        onClose={() => setIsColumnSelectorOpen(false)}
        onSave={handleSaveVisibleColumns}
      />
    </div>
  )
}
