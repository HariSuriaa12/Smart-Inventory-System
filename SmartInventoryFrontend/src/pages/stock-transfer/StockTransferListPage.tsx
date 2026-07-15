import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchTransfers, updateTransfer } from '@/store/slices/stockTransferSlice'
import { fetchAllLocations } from '@/store/slices/locationSlice'
import { fetchItems } from '@/store/slices/itemSlice'
import { DataGrid, Card, Column } from '@/components'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { StockTransferModal } from '@/components/modals/StockTransferModal'
import { ReceivedQuantityModal } from '@/components/modals/ReceivedQuantityModal'
import { StockTransfer, StockTransferStatus, StockTransferStatusLabel } from '@/types/stocktransfer'
import { Plus, Columns3, Package, X, RotateCcw } from 'lucide-react'

const PAGE_SIZE = 10

const MANDATORY_COLUMNS = [
  { key: 'id', label: 'Transfer ID' },
  { key: 'from_Location_Name', label: 'From Location' },
  { key: 'to_Location_Name', label: 'To Location' },
  { key: 'item_Name', label: 'Item' },
  { key: 'transfer_Quantity', label: 'Quantity' },
  { key: 'received_Quantity', label: 'Received Qty' },
  { key: 'status', label: 'Status' },
]

const OPTIONAL_COLUMNS = [
  { key: 'item_Code', label: 'Item Code' },
  { key: 'transfer_Date', label: 'Transfer Date' },
  { key: 'transfer_Time', label: 'Time' },
  { key: 'user_Full_Name', label: 'Created User' },
  { key: 'user_Staff_Code', label: 'User Staff Code' },
  { key: 'sub_Total', label: 'Total' },
  { key: 'remark', label: 'Remarks' },
]

const STORAGE_KEY = 'st_visible_columns'

const STATUS_BADGE_CLASSES: Record<StockTransferStatus, string> = {
  [StockTransferStatus.Shipped]: 'bg-blue-100 text-blue-800',
  [StockTransferStatus.PartiallyReceived]: 'bg-yellow-100 text-yellow-800',
  [StockTransferStatus.Received]: 'bg-green-100 text-green-800',
  [StockTransferStatus.Cancelled]: 'bg-red-100 text-red-800',
}

const getContextualStatusLabel = (transfer: StockTransfer, currentLocationId?: number): string => {
  if (transfer.status === StockTransferStatus.Cancelled) return StockTransferStatusLabel[StockTransferStatus.Cancelled]
  if (transfer.status === StockTransferStatus.Received) return StockTransferStatusLabel[StockTransferStatus.Received]
  if (transfer.status === StockTransferStatus.PartiallyReceived) return StockTransferStatusLabel[StockTransferStatus.PartiallyReceived]

  // For Shipped status, show based on perspective
  if (transfer.status === StockTransferStatus.Shipped) {
    if (currentLocationId === transfer.to_Location_Id) {
      return 'To Receive'
    }
    return StockTransferStatusLabel[StockTransferStatus.Shipped]
  }

  return StockTransferStatusLabel[transfer.status]
}

export const StockTransferListPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [transferIdFilter, setTransferIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StockTransferStatus | '' | 'toReceive'>('')
  const [transferTypeFilter, setTransferTypeFilter] = useState<'shipped' | 'received' | ''>('')
  const [fromLocationFilter, setFromLocationFilter] = useState('')
  const [toLocationFilter, setToLocationFilter] = useState('')
  const [itemFilter, setItemFilter] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isReceivedModalOpen, setIsReceivedModalOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null)
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
    return new Set()
  })

  const { transfers, loading, total } = useAppSelector((state) => state.stockTransfer)
  const { locations } = useAppSelector((state) => state.locations)
  const { items } = useAppSelector((state) => state.items)
  const { user } = useAppSelector((state) => state.auth)
  const currentLocation = useAppSelector((state) => state.locations.currentLocation)

  useEffect(() => {
    dispatch(fetchAllLocations() as any)
    dispatch(fetchItems({ skip: 0, take: 500 }) as any)
  }, [dispatch])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      let finalFromLocationId = fromLocationFilter ? Number(fromLocationFilter) : undefined
      let finalToLocationId = toLocationFilter ? Number(toLocationFilter) : undefined
      let finalStatus: StockTransferStatus | undefined = undefined

      if (statusFilter && statusFilter !== 'toReceive') {
        finalStatus = Number(statusFilter) as StockTransferStatus
      }

      // Handle "To Receive" filter: status 1 (PartiallyReceived) + to_location = current location
      if (statusFilter === 'toReceive' && currentLocation?.id) {
        finalStatus = StockTransferStatus.PartiallyReceived
        finalToLocationId = currentLocation.id
      }

      if (transferTypeFilter === 'shipped' && currentLocation?.id) {
        finalFromLocationId = currentLocation.id
      } else if (transferTypeFilter === 'received' && currentLocation?.id) {
        finalToLocationId = currentLocation.id
      }

      dispatch(fetchTransfers({
        skip: 0,
        take: PAGE_SIZE,
        id: transferIdFilter ? Number(transferIdFilter) : undefined,
        status: finalStatus,
        fromLocationId: finalFromLocationId,
        toLocationId: finalToLocationId,
        itemId: itemFilter ? Number(itemFilter) : undefined,
      }) as any)
    }, 800)
    return () => clearTimeout(debounceTimer)
  }, [statusFilter, transferIdFilter, transferTypeFilter, fromLocationFilter, toLocationFilter, itemFilter, currentLocation, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    let finalFromLocationId = fromLocationFilter ? Number(fromLocationFilter) : undefined
    let finalToLocationId = toLocationFilter ? Number(toLocationFilter) : undefined
    let finalStatus: StockTransferStatus | undefined = undefined

    if (statusFilter && statusFilter !== 'toReceive') {
      finalStatus = Number(statusFilter) as StockTransferStatus
    }

    // Handle "To Receive" filter: status 1 (PartiallyReceived) + to_location = current location
    if (statusFilter === 'toReceive' && currentLocation?.id) {
      finalStatus = StockTransferStatus.PartiallyReceived
      finalToLocationId = currentLocation.id
    }

    if (transferTypeFilter === 'shipped' && currentLocation?.id) {
      finalFromLocationId = currentLocation.id
    } else if (transferTypeFilter === 'received' && currentLocation?.id) {
      finalToLocationId = currentLocation.id
    }

    dispatch(fetchTransfers({
      skip,
      take: PAGE_SIZE,
      id: transferIdFilter ? Number(transferIdFilter) : undefined,
      status: finalStatus,
      fromLocationId: finalFromLocationId,
      toLocationId: finalToLocationId,
      itemId: itemFilter ? Number(itemFilter) : undefined,
    }) as any)
  }, [currentPage])

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false)
    dispatch(fetchTransfers({ skip: 0, take: PAGE_SIZE }) as any)
    setCurrentPage(1)
  }, [dispatch])

  const handleReceiveClick = useCallback((transfer: StockTransfer) => {
    setSelectedTransfer(transfer)
    setIsReceivedModalOpen(true)
  }, [])

  const handleSaveVisibleColumns = useCallback((newVisibleColumns: Set<string>) => {
    setVisibleColumns(newVisibleColumns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newVisibleColumns)))
  }, [])

  const allColumnDefinitions: Record<string, Column<StockTransfer>> = useMemo(() => {
    return ({
    id: {
      key: 'id',
      label: 'Transfer ID',
      width: '100px',
    },
    from_Location_Name: {
      key: 'from_Location_Name',
      label: 'From Location',
      width: '150px',
      render: (value) => value || '-',
    },
    to_Location_Name: {
      key: 'to_Location_Name',
      label: 'To Location',
      width: '150px',
      render: (value) => value || '-',
    },
    item_Name: {
      key: 'item_Name',
      label: 'Item',
      width: '150px',
      render: (value) => value || '-',
    },
    item_Code: {
      key: 'item_Code',
      label: 'Item Code',
      width: '120px',
      render: (value) => value || '-',
    },
    transfer_Date: {
      key: 'transfer_Date',
      label: 'Transfer Date',
      width: '130px',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-',
    },
    transfer_Time: {
      key: 'transfer_Time',
      label: 'Time',
      width: '100px',
      render: (value) => value ? new Date(`2000-01-01T${value}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    transfer_Quantity: {
      key: 'transfer_Quantity',
      label: 'Quantity',
      width: '120px',
      align: 'right',
      render: (value) => Number(value).toFixed(2),
    },
    received_Quantity: {
      key: 'received_Quantity',
      label: 'Received Qty',
      width: '130px',
      align: 'right',
      render: (value) => Number(value).toFixed(2),
    },
    sub_Total: {
      key: 'sub_Total',
      label: 'Total',
      width: '120px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    status: {
      key: 'status',
      label: 'Status',
      width: '150px',
      render: (value: StockTransferStatus, transfer: StockTransfer) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[value]}`}>
          {getContextualStatusLabel(transfer, currentLocation?.id)}
        </span>
      ),
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
  })
  }, [currentLocation])

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

  const handleCancel = useCallback(async (transfer: StockTransfer) => {
    if (!window.confirm('Are you sure you want to cancel this stock transfer?')) return
    try {
      await dispatch(updateTransfer({
        id: transfer.id,
        data: {
          status: StockTransferStatus.Cancelled,
        },
      }) as any)
      dispatch(fetchTransfers({
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }) as any)
    } catch (error) {
      alert('Failed to cancel transfer')
    }
  }, [dispatch, currentPage])

  const handleCancelWithReturn = useCallback(async (transfer: StockTransfer) => {
    if (!window.confirm('Are you sure you want to cancel this transfer and return the received stock?')) return
    try {
      await dispatch(updateTransfer({
        id: transfer.id,
        data: {
          status: StockTransferStatus.Cancelled,
          received_Quantity: 0,
        },
      }) as any)
      dispatch(fetchTransfers({
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }) as any)
    } catch (error) {
      alert('Failed to cancel and return transfer')
    }
  }, [dispatch, currentPage])

  const handleActionClick = useCallback((transfer: StockTransfer, action: string) => {
    switch (action) {
      case 'receive':
        handleReceiveClick(transfer)
        break
      case 'cancel':
        handleCancel(transfer)
        break
      case 'cancelWithReturn':
        handleCancelWithReturn(transfer)
        break
    }
  }, [handleReceiveClick, handleCancel, handleCancelWithReturn])

  const columnsWithActions = useMemo(() => {
    const actionsColumn: Column<StockTransfer> = {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (_, transfer) => (
        <div className="flex gap-2">
          {transfer.to_Location_Id === currentLocation?.id && transfer.status !== StockTransferStatus.Received && (
            <button
              onClick={() => handleActionClick(transfer, 'receive')}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
              title="Receive stock"
            >
              <Package size={16} />
            </button>
          )}
          {transfer.status !== StockTransferStatus.Received && (
            <button
              onClick={() => handleActionClick(transfer, 'cancel')}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title="Cancel transfer"
            >
              <X size={16} />
            </button>
          )}
          {transfer.status !== StockTransferStatus.Cancelled && transfer.status !== StockTransferStatus.Shipped && (
            <button
              onClick={() => handleActionClick(transfer, 'cancelWithReturn')}
              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
              title="Cancel and return stock"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      ),
    }
    return [...columns, actionsColumn]
  }, [columns, handleActionClick, currentLocation])

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Transfer</h1>
          <p className="text-gray-600">Manage stock transfers between locations</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Create Transfer
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex-shrink-0 space-y-3">
        {/* Row 1: Transfer ID, Transfer Type, From Location, To Location */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by Transfer ID..."
            value={transferIdFilter}
            onChange={(e) => setTransferIdFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <select
            value={transferTypeFilter}
            onChange={(e) => setTransferTypeFilter(e.target.value as any)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Transfer Types</option>
            <option value="shipped">Shipped (From Current)</option>
            <option value="received">To Receive (To Current)</option>
          </select>
          <select
            value={fromLocationFilter}
            onChange={(e) => setFromLocationFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All From Locations</option>
            {locations?.map((loc: any) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_Name}
              </option>
            ))}
          </select>
          <select
            value={toLocationFilter}
            onChange={(e) => setToLocationFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All To Locations</option>
            {locations?.map((loc: any) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_Name}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Item, Status */}
        <div className="flex gap-2">
          <select
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Items</option>
            {items?.map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.item_Name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            <option value="toReceive">To Receive (Partial)</option>
            {Object.entries(StockTransferStatusLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
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
              setTransferIdFilter('')
              setTransferTypeFilter('')
              setFromLocationFilter('')
              setToLocationFilter('')
              setItemFilter('')
              setStatusFilter('')
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Data Grid Card */}
      <Card className="flex-1 flex flex-col overflow-hidden p-6">
        <DataGrid<StockTransfer>
          columns={columnsWithActions}
          data={transfers}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          rowKey="id"
          emptyMessage="No stock transfers found"
        />
      </Card>

      {/* Create Transfer Modal */}
      <StockTransferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Received Quantity Modal */}
      {selectedTransfer && (
        <ReceivedQuantityModal
          isOpen={isReceivedModalOpen}
          transfer={selectedTransfer}
          onClose={() => {
            setIsReceivedModalOpen(false)
            setSelectedTransfer(null)
          }}
          onSuccess={() => {
            setIsReceivedModalOpen(false)
            setSelectedTransfer(null)
            dispatch(fetchTransfers({
              skip: (currentPage - 1) * PAGE_SIZE,
              take: PAGE_SIZE,
            }) as any)
          }}
        />
      )}

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
