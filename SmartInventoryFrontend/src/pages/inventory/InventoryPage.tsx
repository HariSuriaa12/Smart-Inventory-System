import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchInventoryByLocation, clearError } from '@/store/slices/inventorySlice'
import { DataGrid, Card, Column } from '@/components'
import { AdjustInventoryModal } from '@/components/modals/AdjustInventoryModal'
import { StockTransferModal } from '@/components/modals/StockTransferModal'
import { ColumnSelectorModal } from '@/components/modals/ColumnSelectorModal'
import { Inventory } from '@/types/inventory'
import { LocationTypeLabel } from '@/types/location'
import { Search, X, ArrowRightLeft, Edit2, AlertCircle, Columns3 } from 'lucide-react'

const PAGE_SIZE = 10

// Define all available columns
const AVAILABLE_COLUMNS = [
  { key: 'Item_ID', label: 'Item Name', defaultVisible: true },
  { key: 'item_code', label: 'Item Code', defaultVisible: false },
  { key: 'item_category', label: 'Category', defaultVisible: false },
  { key: 'item_brand', label: 'Brand', defaultVisible: false },
  { key: 'item_uom', label: 'Unit of Measure', defaultVisible: false },
  { key: 'OnHand_Quantity', label: 'On Hand', defaultVisible: true },
  { key: 'Available_Quantity', label: 'Available', defaultVisible: true },
  { key: 'purchase_cost', label: 'Purchase Cost', defaultVisible: false },
  { key: 'unit_cost', label: 'Unit Cost', defaultVisible: false },
  { key: 'tax_percentage', label: 'Tax %', defaultVisible: false },
  { key: 'location_name', label: 'Location', defaultVisible: false },
  { key: 'location_address', label: 'Location Address', defaultVisible: false },
  { key: 'location_type', label: 'Location Type', defaultVisible: false },
]

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
    return new Set(AVAILABLE_COLUMNS.filter(c => c.defaultVisible).map(c => c.key))
  })

  const { inventory, loading, error } = useAppSelector((state) => state.inventory)
  const { currentLocation } = useAppSelector((state) => state.locations)

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

  const filteredInventory = searchInput.trim()
    ? inventory.filter((item) =>
        item.item?.item_Name?.toLowerCase().includes(searchInput.toLowerCase())
      )
    : inventory

  const allColumnDefinitions: Record<string, Column<Inventory>> = useMemo(() => ({
    Item_ID: {
      key: 'Item_ID',
      label: 'Item Name',
      width: '200px',
      render: (value, item) => item.item?.item_Name || '-',
    },
    item_code: {
      key: 'item_code',
      label: 'Item Code',
      width: '150px',
      render: (value, item) => item.item?.item_Code || '-',
    },
    item_category: {
      key: 'item_category',
      label: 'Category',
      width: '150px',
      render: (value, item) => item.item?.item_Category || '-',
    },
    item_brand: {
      key: 'item_brand',
      label: 'Brand',
      width: '150px',
      render: (value, item) => item.item?.item_Brand || '-',
    },
    item_uom: {
      key: 'item_uom',
      label: 'Unit of Measure',
      width: '130px',
      render: (value, item) => item.item?.unit_Of_Measure || '-',
    },
    OnHand_Quantity: {
      key: 'onHand_Quantity',
      label: 'On Hand',
      width: '120px',
      align: 'right',
      render: (value) => value?.toFixed(2) || '0.00',
    },
    Available_Quantity: {
      key: 'available_Quantity',
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
      render: (value, item) => `$${item.item?.purchase_Cost?.toFixed(2) || '0.00'}`,
    },
    unit_cost: {
      key: 'unit_cost',
      label: 'Unit Cost',
      width: '130px',
      align: 'right',
      render: (value, item) => `$${item.item?.unit_Cost?.toFixed(2) || '0.00'}`,
    },
    tax_percentage: {
      key: 'tax_percentage',
      label: 'Tax %',
      width: '100px',
      align: 'right',
      render: (value, item) => `${item.item?.tax_Percentage?.toFixed(2) || '0.00'}%`,
    },
    location_name: {
      key: 'location_name',
      label: 'Location Name',
      width: '150px',
      render: (value, item) => item.location?.location_Name || '-',
    },
    location_address: {
      key: 'location_address',
      label: 'Location Address',
      width: '200px',
      render: (value, item) => item.location?.address || '-',
    },
    location_type: {
      key: 'location_type',
      label: 'Location Type',
      width: '150px',
      render: (value, item) => LocationTypeLabel[item.location?.location_Type] || '-',
    },
  }), [])

  const columns = useMemo(() =>
    AVAILABLE_COLUMNS
      .filter(col => visibleColumns.has(col.key))
      .map(col => allColumnDefinitions[col.key])
      .filter(Boolean),
    [visibleColumns, allColumnDefinitions]
  )

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

      {/* Data Grid */}
      <Card className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap ${
                        col.align === 'right' ? 'text-right' : ''
                      }`}
                      style={col.width ? { width: col.width, minWidth: col.width } : {}}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap w-32 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                      No inventory found
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.ID} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {columns.map((col) => {
                        const value = item[col.key as keyof Inventory]
                        const rendered = col.render ? col.render(value, item) : value
                        return (
                          <td
                            key={String(col.key)}
                            className={`px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis ${
                              col.align === 'right' ? 'text-right' : ''
                            }`}
                            title={typeof rendered === 'string' ? rendered : undefined}
                          >
                            {rendered}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-center">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
