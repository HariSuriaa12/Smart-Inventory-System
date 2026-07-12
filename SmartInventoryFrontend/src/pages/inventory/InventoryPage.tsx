import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchInventoryByLocation, clearError } from '@/store/slices/inventorySlice'
import { DataGrid, Card, Column } from '@/components'
import { AdjustInventoryModal } from '@/components/modals/AdjustInventoryModal'
import { StockTransferModal } from '@/components/modals/StockTransferModal'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { Inventory } from '@/types/inventory'
import { Search, X, ArrowRightLeft, Edit2, AlertCircle, Columns3 } from 'lucide-react'

const PAGE_SIZE = 10

// Mandatory columns that users cannot remove
const MANDATORY_COLUMNS = [
  { key: 'Item_ID', label: 'Item Name' },
  { key: 'item_code', label: 'Item Code' },
  { key: 'item_uom', label: 'Unit of Measure' },
  { key: 'OnHand_Quantity', label: 'On Hand' },
  { key: 'Available_Quantity', label: 'Available' },
]

// Optional columns that users can toggle
const OPTIONAL_COLUMNS = [
  { key: 'item_category', label: 'Category' },
  { key: 'item_brand', label: 'Brand' },
  { key: 'purchase_cost', label: 'Purchase Cost' },
  { key: 'unit_cost', label: 'Unit Cost' },
  { key: 'tax_percentage', label: 'Tax %' },
]

// All available columns for selector
const AVAILABLE_COLUMNS = OPTIONAL_COLUMNS

const STORAGE_KEY = 'inventory_visible_columns'

export const InventoryPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
    return new Set()
  })

  const { inventory, loading, error, total } = useAppSelector((state) => state.inventory)
  const { currentLocation } = useAppSelector((state) => state.locations)

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      if (currentLocation) {
        const skip = 0
        dispatch(fetchInventoryByLocation({ locationId: currentLocation.id, skip, take: PAGE_SIZE }) as any)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchInput, currentLocation, dispatch])

  // Fetch inventory when location or page changes
  useEffect(() => {
    if (currentLocation) {
      const skip = (currentPage - 1) * PAGE_SIZE
      dispatch(fetchInventoryByLocation({ locationId: currentLocation.id, skip, take: PAGE_SIZE }) as any)
    }
  }, [currentLocation, currentPage, dispatch])

  const handleAdjustClick = useCallback((inventory: Inventory) => {
    setSelectedInventory(inventory)
    setIsAdjustOpen(true)
  }, [])

  const handleTransferClick = useCallback((inventory: Inventory) => {
    setSelectedInventory(inventory)
    setIsTransferOpen(true)
  }, [])

  const handleAdjustSuccess = useCallback(() => {
    setIsAdjustOpen(false)
    setSelectedInventory(null)
    if (currentLocation) {
      dispatch(fetchInventoryByLocation({ locationId: currentLocation.id, skip: 0, take: PAGE_SIZE }) as any)
    }
  }, [currentLocation, dispatch])

  const handleTransferSuccess = useCallback(() => {
    setIsTransferOpen(false)
    setSelectedInventory(null)
    if (currentLocation) {
      dispatch(fetchInventoryByLocation({ locationId: currentLocation.id, skip: 0, take: PAGE_SIZE }) as any)
    }
  }, [currentLocation, dispatch])

  const handleSaveVisibleColumns = useCallback((newVisibleColumns: Set<string>) => {
    setVisibleColumns(newVisibleColumns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newVisibleColumns)))
  }, [])

  const allColumnDefinitions: Record<string, Column<Inventory>> = useMemo(() => ({
    Item_ID: {
      key: 'Item_ID',
      label: 'Item Name',
      width: '200px',
      render: (value, item) => item.Item?.Item_Name || '-',
    },
    item_code: {
      key: 'item_code',
      label: 'Item Code',
      width: '150px',
      render: (value, item) => item.Item?.Item_Code || '-',
    },
    item_category: {
      key: 'item_category',
      label: 'Category',
      width: '150px',
      render: (value, item) => item.Item?.Item_Category || '-',
    },
    item_brand: {
      key: 'item_brand',
      label: 'Brand',
      width: '150px',
      render: (value, item) => item.Item?.Item_Brand || '-',
    },
    item_uom: {
      key: 'item_uom',
      label: 'Unit of Measure',
      width: '130px',
      render: (value, item) => item.Item?.Unit_Of_Measure || '-',
    },
    OnHand_Quantity: {
      key: 'OnHand_Quantity',
      label: 'On Hand',
      width: '120px',
      align: 'right',
      render: (value) => value?.toFixed(2) || '0.00',
    },
    Available_Quantity: {
      key: 'Available_Quantity',
      label: 'Available',
      width: '120px',
      align: 'right',
      render: (value) => value?.toFixed(2) || '0.00',
    },
    purchase_cost: {
      key: 'purchase_cost',
      label: 'Purchase Cost',
      width: '130px',
      align: 'right',
      render: (value, item) => `$${item.Item?.Purchase_Cost?.toFixed(2) || '0.00'}`,
    },
    unit_cost: {
      key: 'unit_cost',
      label: 'Unit Cost',
      width: '130px',
      align: 'right',
      render: (value, item) => `$${item.Item?.Unit_Cost?.toFixed(2) || '0.00'}`,
    },
    tax_percentage: {
      key: 'tax_percentage',
      label: 'Tax %',
      width: '100px',
      align: 'right',
      render: (value, item) => `${item.Item?.Tax_Percentage?.toFixed(2) || '0.00'}%`,
    },
  }), [])

  const columns = useMemo(() => {
    // Always include mandatory columns first
    const mandatoryCols = MANDATORY_COLUMNS
      .map(col => allColumnDefinitions[col.key])
      .filter(Boolean)

    // Then add selected optional columns
    const optionalCols = AVAILABLE_COLUMNS
      .filter(col => visibleColumns.has(col.key))
      .map(col => allColumnDefinitions[col.key])
      .filter(Boolean)

    return [...mandatoryCols, ...optionalCols]
  }, [visibleColumns, allColumnDefinitions])

  if (!currentLocation) {
    return (
      <div className="p-6 space-y-6 h-full flex flex-col">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">View and manage inventory for selected location</p>
        </div>
        <Card className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={48} className="text-gray-400" />
            <p className="text-gray-500 text-lg">Please select a location from the top bar</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">
          Viewing inventory for <span className="font-semibold text-primary-600">{currentLocation.location_Name}</span>
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="text-red-400 hover:text-red-600"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Search Bar & Column Selector */}
      <div className="flex-shrink-0 flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
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
        <DataGrid<Inventory>
          columns={[...columns, {
            key: 'actions' as any,
            label: 'Actions',
            width: '120px',
            align: 'center',
            render: (_, item) => (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleAdjustClick(item)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Adjust Inventory"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleTransferClick(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Transfer Stock"
                >
                  <ArrowRightLeft size={16} />
                </button>
              </div>
            ),
          }]}
          data={inventory}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          rowKey="ID"
          emptyMessage="No inventory found"
        />
      </Card>

      {/* Column Selector Modal */}
      <ColumnSelectorModal
        isOpen={isColumnSelectorOpen}
        columns={AVAILABLE_COLUMNS}
        visibleColumns={visibleColumns}
        onClose={() => setIsColumnSelectorOpen(false)}
        onSave={handleSaveVisibleColumns}
      />

      {/* Adjust Inventory Modal */}
      <AdjustInventoryModal
        isOpen={isAdjustOpen}
        inventory={selectedInventory}
        onClose={() => {
          setIsAdjustOpen(false)
          setSelectedInventory(null)
        }}
        onSuccess={handleAdjustSuccess}
      />

      {/* Stock Transfer Modal */}
      <StockTransferModal
        isOpen={isTransferOpen}
        inventory={selectedInventory}
        currentLocation={currentLocation?.id || null}
        onClose={() => {
          setIsTransferOpen(false)
          setSelectedInventory(null)
        }}
        onSuccess={handleTransferSuccess}
      />
    </div>
  )
}
