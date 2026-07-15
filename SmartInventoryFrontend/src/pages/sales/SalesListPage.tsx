import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSalesFiltered } from '@/store/slices/salesSlice'
import { DataGrid, Card, Column } from '@/components'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { Sales, SalesStatus, SalesStatusLabel } from '@/types/sales'
import { Columns3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 10

const MANDATORY_COLUMNS = [
  { key: 'id', label: 'Sales ID' },
  { key: 'sales_Date', label: 'Date' },
  { key: 'sales_Number', label: 'Sales Number' },
  { key: 'total_Amount', label: 'Total Amount' },
  { key: 'sales_Status', label: 'Status' },
]

const OPTIONAL_COLUMNS = [
  { key: 'sales_Time', label: 'Time' },
  { key: 'location_Name', label: 'Location Name' },
]

const STORAGE_KEY = 'sales_visible_columns'

const STATUS_BADGE_CLASSES: Record<SalesStatus, string> = {
  [SalesStatus.Confirmed]: 'bg-blue-100 text-blue-800',
  [SalesStatus.Completed]: 'bg-green-100 text-green-800',
  [SalesStatus.Refunded]: 'bg-yellow-100 text-yellow-800',
  [SalesStatus.Cancelled]: 'bg-red-100 text-red-800',
}

export const SalesListPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [salesIdFilter, setSalesIdFilter] = useState('')
  const [salesNumberFilter, setSalesNumberFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<SalesStatus | ''>('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
    return new Set()
  })

  const { sales, loading, total } = useAppSelector((state) => state.sales)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      dispatch(fetchSalesFiltered({
        skip: 0,
        take: PAGE_SIZE,
        salesId: salesIdFilter ? Number(salesIdFilter) : undefined,
        salesNumber: salesNumberFilter || undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
      }) as any)
    }, 800)
    return () => clearTimeout(debounceTimer)
  }, [statusFilter, salesIdFilter, salesNumberFilter, dateFromFilter, dateToFilter, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchSalesFiltered({
      skip,
      take: PAGE_SIZE,
      salesId: salesIdFilter ? Number(salesIdFilter) : undefined,
      salesNumber: salesNumberFilter || undefined,
      status: statusFilter ? Number(statusFilter) : undefined,
      dateFrom: dateFromFilter || undefined,
      dateTo: dateToFilter || undefined,
    }) as any)
  }, [currentPage])

  const handleRowDoubleClick = useCallback((sale: Sales) => {
    navigate(`/app/sales/${sale.id}`)
  }, [navigate])

  const handleSaveVisibleColumns = useCallback((newVisibleColumns: Set<string>) => {
    setVisibleColumns(newVisibleColumns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newVisibleColumns)))
  }, [])

  const allColumnDefinitions: Record<string, Column<Sales>> = useMemo(() => ({
    id: {
      key: 'id',
      label: 'Sales ID',
      width: '100px',
    },
    sales_Number: {
      key: 'sales_Number',
      label: 'Sales Number',
      width: '150px',
      render: (value) => value || '-',
    },
    sales_Date: {
      key: 'sales_Date',
      label: 'Date',
      width: '130px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    sales_Time: {
      key: 'sales_Time',
      label: 'Time',
      width: '100px',
      render: (value) => {
        if (!value) return '-'
        try {
          const [hours, minutes] = value.split(':')
          return `${hours}:${minutes}`
        } catch {
          return '-'
        }
      },
    },
    location_Name: {
      key: 'location_Name',
      label: 'Location Name',
      width: '180px',
      render: (value) => value || '-',
    },
    total_Amount: {
      key: 'total_Amount',
      label: 'Total Amount',
      width: '140px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    sales_Status: {
      key: 'sales_Status',
      label: 'Status',
      width: '140px',
      render: (value) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value as SalesStatus]}`}>
          {SalesStatusLabel[value as SalesStatus]}
        </span>
      ),
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
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales</h1>
        <p className="text-gray-600">View sales records from POS integration</p>
      </div>

      {/* Filter Bar */}
      <div className="flex-shrink-0 space-y-3">
        {/* Row 1: Sales ID, Sales Number, Status */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by Sales ID..."
            value={salesIdFilter}
            onChange={(e) => setSalesIdFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <input
            type="text"
            placeholder="Filter by Sales Number..."
            value={salesNumberFilter}
            onChange={(e) => setSalesNumberFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SalesStatus | '')}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            {Object.entries(SalesStatusLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Date Range */}
        <div className="flex gap-2">
          <input
            type="date"
            value={dateFromFilter}
            onChange={(e) => setDateFromFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            placeholder="From Date"
          />
          <input
            type="date"
            value={dateToFilter}
            onChange={(e) => setDateToFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            placeholder="To Date"
          />
          <div className="flex-1" />
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
              setSalesIdFilter('')
              setSalesNumberFilter('')
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
        <DataGrid<Sales>
          columns={columns}
          data={sales}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No sales found"
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
