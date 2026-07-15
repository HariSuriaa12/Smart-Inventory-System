import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchOrderFulfillments } from '@/store/slices/orderFulfillmentSlice'
import { fetchCustomers } from '@/store/slices/customerSlice'
import { useNavigate } from 'react-router-dom'
import { Card, DataGrid, Column } from '@/components'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { OrderFulfillment, OrderFulfillmentStatus, OrderFulfillmentStatusLabel } from '@/types/orderfulfillment'
import { Columns3 } from 'lucide-react'

const PAGE_SIZE = 10

const MANDATORY_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'order_Date', label: 'Order Date' },
  { key: 'customer_Name', label: 'Customer' },
  { key: 'total_Amount', label: 'Total Amount' },
  { key: 'status', label: 'Status' },
]

const OPTIONAL_COLUMNS = [
  { key: 'location_Name', label: 'Location' },
  { key: 'shipment_City', label: 'Shipment City' },
  { key: 'shipment_State', label: 'State' },
  { key: 'shipment_PostCode', label: 'Post Code' },
  { key: 'remark', label: 'Remarks' },
  { key: 'verified_By_Name', label: 'Verified By' },
]

const STORAGE_KEY = 'of_visible_columns'

const STATUS_BADGE_CLASSES: Record<OrderFulfillmentStatus, string> = {
  [OrderFulfillmentStatus.Unassigned]: 'bg-red-100 text-red-800',
  [OrderFulfillmentStatus.OnHold]: 'bg-gray-100 text-gray-800',
  [OrderFulfillmentStatus.PartiallyFulfilled]: 'bg-yellow-100 text-yellow-800',
  [OrderFulfillmentStatus.Fulfilled]: 'bg-green-100 text-green-800',
  [OrderFulfillmentStatus.Cancelled]: 'bg-red-100 text-red-800',
  [OrderFulfillmentStatus.Verified]: 'bg-blue-100 text-blue-800',
}

export const OrderFulfillmentListPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [fulfillmentIdFilter, setFulfillmentIdFilter] = useState('')
  const [customerIdFilter, setCustomerIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderFulfillmentStatus | ''>('')
  const [unprocessedOnlyFilter, setUnprocessedOnlyFilter] = useState(false)
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
    return new Set()
  })

  const { orders, loading, total } = useAppSelector((state) => state.orderFulfillment)
  const { customers } = useAppSelector((state) => state.customers)
  const { currentLocation } = useAppSelector((state) => state.locations)

  // Fetch customers on mount
  useEffect(() => {
    dispatch(fetchCustomers({ skip: 0, take: 100 }) as any)
  }, [dispatch])

  // Debounce filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      dispatch(fetchOrderFulfillments({
        skip: 0,
        take: PAGE_SIZE,
        fulfillmentId: fulfillmentIdFilter ? Number(fulfillmentIdFilter) : undefined,
        customerId: customerIdFilter ? Number(customerIdFilter) : undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
        unprocessedOnly: unprocessedOnlyFilter ? true : undefined,
      }) as any)
    }, 800)
    return () => clearTimeout(debounceTimer)
  }, [fulfillmentIdFilter, customerIdFilter, statusFilter, unprocessedOnlyFilter, dispatch])

  // Fetch when page changes
  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchOrderFulfillments({
      skip,
      take: PAGE_SIZE,
      fulfillmentId: fulfillmentIdFilter ? Number(fulfillmentIdFilter) : undefined,
      customerId: customerIdFilter ? Number(customerIdFilter) : undefined,
      status: statusFilter ? Number(statusFilter) : undefined,
      unprocessedOnly: unprocessedOnlyFilter ? true : undefined,
    }) as any)
  }, [currentPage])

  const handleClearFilters = useCallback(() => {
    setFulfillmentIdFilter('')
    setCustomerIdFilter('')
    setStatusFilter('')
    setUnprocessedOnlyFilter(false)
    setCurrentPage(1)
  }, [])

  const handleRowDoubleClick = useCallback((order: OrderFulfillment) => {
    navigate(`/app/order-fulfillment/${order.id}`)
  }, [navigate])

  const handleSaveVisibleColumns = useCallback((newVisibleColumns: Set<string>) => {
    setVisibleColumns(newVisibleColumns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newVisibleColumns)))
  }, [])

  const allColumnDefinitions: Record<string, Column<OrderFulfillment>> = useMemo(() => ({
    id: {
      key: 'id',
      label: 'ID',
      width: '80px',
    },
    order_Date: {
      key: 'order_Date',
      label: 'Order Date',
      width: '130px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    customer_Name: {
      key: 'customer_Name',
      label: 'Customer',
      width: '180px',
      render: (value) => value || '-',
    },
    location_Name: {
      key: 'location_Name',
      label: 'Location',
      width: '150px',
      render: (value) => value || '-',
    },
    shipment_City: {
      key: 'shipment_City',
      label: 'Shipment City',
      width: '150px',
      render: (value) => value || '-',
    },
    shipment_State: {
      key: 'shipment_State',
      label: 'State',
      width: '120px',
      render: (value) => value || '-',
    },
    shipment_PostCode: {
      key: 'shipment_PostCode',
      label: 'Post Code',
      width: '120px',
      render: (value) => value || '-',
    },
    total_Amount: {
      key: 'total_Amount',
      label: 'Total Amount',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    status: {
      key: 'status',
      label: 'Status',
      width: '140px',
      render: (value: OrderFulfillmentStatus) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value]}`}>
          {OrderFulfillmentStatusLabel[value]}
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
    verified_By_Name: {
      key: 'verified_By_Name',
      label: 'Verified By',
      width: '150px',
      render: (value) => value || '-',
    },
  }), [])

  const columns = useMemo(() => {
    const mandatoryCols = MANDATORY_COLUMNS
      .map(({ key }) => allColumnDefinitions[key])
      .filter(Boolean)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Fulfillments</h1>
          <p className="text-gray-600">Manage and fulfill customer orders</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex-shrink-0 space-y-3">
        {/* Row 1: Fulfillment ID, Customer Dropdown, Status */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by Fulfillment ID..."
            value={fulfillmentIdFilter}
            onChange={(e) => setFulfillmentIdFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <select
            value={customerIdFilter}
            onChange={(e) => setCustomerIdFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Customers</option>
            {customers?.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.company_Name || customer.customer_Name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            {Object.entries(OrderFulfillmentStatusLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Actions */}
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
            onClick={handleClearFilters}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Data Grid Card */}
      <Card className="flex-1 flex flex-col overflow-hidden p-6">
        <DataGrid<OrderFulfillment>
          columns={columns}
          data={orders}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No order fulfillments found"
        />
      </Card>

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
