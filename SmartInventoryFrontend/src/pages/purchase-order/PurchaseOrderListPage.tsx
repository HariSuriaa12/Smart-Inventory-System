import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchPOs } from '@/store/slices/purchaseOrderSlice'
import { DataGrid, Card, Column } from '@/components'
import { CreatePurchaseOrderModal } from '@/components/modals/CreatePurchaseOrderModal'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { DateRangePicker } from '@/components/DateRangePicker'
import { fetchVendors } from '@/store/slices/vendorSlice'
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderStatusLabel } from '@/types/purchaseorder'
import { Plus, Columns3 } from 'lucide-react'
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
  { key: 'vendor_Mobile', label: 'Vendor Phone' },
  { key: 'location_Name', label: 'Location Name' },
  { key: 'vendor_Company_Address', label: 'Vendor Company Address' },
  // { key: 'purchase_Time', label: 'Time' },
  // { key: 'items_Count', label: 'Items Count' },
  // { key: 'received_Count', label: 'Received Items' },
  { key: 'remark', label: 'Remarks' },
  { key: 'user_Full_Name', label: 'Created User' },
  { key: 'user_Staff_Code', label: 'User Staff Code' },
  { key: 'user_Mobile_No', label: 'User Phone' },
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
  const [poIdFilter, setPoIdFilter] = useState('')
  const [poRefFilter, setPoRefFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
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
  const { vendors } = useAppSelector((state) => state.vendors)

  useEffect(() => {
    dispatch(fetchVendors({ skip: 0, take: 100 }) as any)
  }, [dispatch])

  // Debounce all filters together
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      dispatch(fetchPOs({
        skip: 0,
        take: PAGE_SIZE,
        poId: poIdFilter ? Number(poIdFilter) : undefined,
        poRefNo: poRefFilter || undefined,
        vendorId: vendorFilter ? Number(vendorFilter) : undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
      }) as any)
    }, 800)
    return () => clearTimeout(debounceTimer)
  }, [statusFilter, poIdFilter, poRefFilter, vendorFilter, dateFromFilter, dateToFilter, dispatch])

  // Fetch when page changes (no debounce needed)
  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchPOs({
      skip,
      take: PAGE_SIZE,
      poId: poIdFilter ? Number(poIdFilter) : undefined,
      poRefNo: poRefFilter || undefined,
      vendorId: vendorFilter ? Number(vendorFilter) : undefined,
      status: statusFilter ? Number(statusFilter) : undefined,
      dateFrom: dateFromFilter || undefined,
      dateTo: dateToFilter || undefined,
    }) as any)
  }, [currentPage])

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
      //render: (_, po) => po.vendor?.email || '-',
      render: (value) => value || '-',
    },
    vendor_Mobile: {
      key: 'vendor_Mobile',
      label: 'Vendor Phone',
      width: '130px',
      //render: (_, po) => po.vendor?.mobile || po.vendor?.phone_No || '-',
      render: (value) => value || '-',
    },
    vendor_Company_Address: {
      key: 'vendor_Company_Address',
      label: 'Vendor Company Address',
      width: '200px',
      //render: (_, po) => po.vendor?.company_Address || '-',
      render: (value) => value || '-',
    },
    location_Name: {
      key: 'location_Name',
      label: 'Location Name',
      width: '150px',
      render: (value) => value || '-',
    },
    total_Amount: {
      key: 'total_Amount',
      label: 'Total Amount',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    // items_Count: {
    //   key: 'items_Count',
    //   label: 'Items Count',
    //   width: '120px',
    //   align: 'center',
    //   render: (_, po) => po.items?.length || 0,
    // },
    // received_Count: {
    //   key: 'received_Count',
    //   label: 'Received Items',
    //   width: '130px',
    //   align: 'center',
    //   render: (_, po) => po.items?.filter(i => i.received_Quantity > 0).length || 0,
    // },
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
      label: 'Created User',
      width: '150px',
      render: (value) => value || '-',
    },
    user_Staff_Code: {
      key: 'user_Staff_Code',
      label: 'User Staff Code',
      width: '150px',
      render: (value) => value || '-',
    },
    user_Mobile_No: {
      key: 'user_Mobile_No',
      label: 'User Mobile No',
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

      {/* Filter Bar */}
      <div className="flex-shrink-0 space-y-3">
        {/* Row 1: PO ID, Reference, Vendor, Status */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by PO ID..."
            value={poIdFilter}
            onChange={(e) => setPoIdFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <input
            type="text"
            placeholder="Filter by PO Reference..."
            value={poRefFilter}
            onChange={(e) => setPoRefFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Vendors</option>
            {vendors?.map((vendor: any) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.vendor_Name || vendor.company_Name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            {Object.entries(PurchaseOrderStatusLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Date Range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <DateRangePicker
              startDate={dateFromFilter}
              endDate={dateToFilter}
              onStartDateChange={setDateFromFilter}
              onEndDateChange={setDateToFilter}
            />
          </div>
          {/* Spacer to align with actions row */}
          <div className="w-0" />
        </div>

        {/* Row 3: Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setIsColumnSelectorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap text-sm"
            title="Select columns to display"
          >
            <Columns3 size={18} />
            <span className="hidden sm:inline">Columns</span>
          </button>
          <button
            onClick={() => {
              setPoIdFilter('')
              setPoRefFilter('')
              setVendorFilter('')
              setStatusFilter('')
              setDateFromFilter('')
              setDateToFilter('')
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Clear
          </button>
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
