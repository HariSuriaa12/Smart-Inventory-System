import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSalesFiltered } from '@/store/slices/salesSlice'
import { DataGrid, Card, Column } from '@/components'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { DateRangePicker } from '@/components/DateRangePicker'
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

  const handleClearFilters = useCallback(() => {
    setSalesIdFilter('')
    setSalesNumberFilter('')
    setStatusFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setCurrentPage(1)
  }, [])

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
      width: '80px',
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
    sales_Status: {
      key: 'sales_Status',
      label: 'Status',
      width: '120px',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value as SalesStatus]}`}>
          {SalesStatusLabel[value as SalesStatus]}
        </span>
      ),
    },
  }), [])

  const displayColumns = useMemo(() => {
    const mandatoryKeys = new Set(MANDATORY_COLUMNS.map(col => col.key))
    const selected = visibleColumns.size > 0 ? visibleColumns : mandatoryKeys
    return [...MANDATORY_COLUMNS, ...OPTIONAL_COLUMNS]
      .filter(col => selected.has(col.key))
      .map(col => allColumnDefinitions[col.key])
      .filter(Boolean)
  }, [visibleColumns, allColumnDefinitions])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">View and manage sales records from POS integration</p>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sales ID</label>
              <input
                type="number"
                placeholder="Search by ID"
                value={salesIdFilter}
                onChange={(e) => setSalesIdFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sales Number</label>
              <input
                type="text"
                placeholder="Search by number"
                value={salesNumberFilter}
                onChange={(e) => setSalesNumberFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SalesStatus | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                {Object.entries(SalesStatusLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <DateRangePicker
              dateFrom={dateFromFilter}
              dateTo={dateToFilter}
              onDateFromChange={setDateFromFilter}
              onDateToChange={setDateToFilter}
            />

            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>

            <button
              onClick={() => setIsColumnSelectorOpen(true)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Columns3 size={18} />
              Columns
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <DataGrid
          columns={displayColumns}
          data={sales}
          loading={loading}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </Card>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {sales.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
          {Math.min(currentPage * PAGE_SIZE, total)} of {total} sales
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!hasPreviousPage}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-primary-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={!hasNextPage}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <ColumnSelectorModal
        isOpen={isColumnSelectorOpen}
        onClose={() => setIsColumnSelectorOpen(false)}
        columns={[...MANDATORY_COLUMNS, ...OPTIONAL_COLUMNS]}
        visibleColumns={visibleColumns}
        mandatoryColumns={MANDATORY_COLUMNS}
        onSave={handleSaveVisibleColumns}
      />
    </div>
  )
}
