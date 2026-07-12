import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchInventoryByLocation, clearError } from '@/store/slices/inventorySlice'
import { DataGrid, Card, Column } from '@/components'
import { AdjustInventoryModal } from '@/components/modals/AdjustInventoryModal'
import { StockTransferModal } from '@/components/modals/StockTransferModal'
import { Inventory } from '@/types/inventory'
import { Search, X, ArrowRightLeft, Edit2, AlertCircle } from 'lucide-react'

const PAGE_SIZE = 10

export const InventoryPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)

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

  const filteredInventory = searchInput.trim()
    ? inventory.filter((item) =>
        item.Item_Name?.toLowerCase().includes(searchInput.toLowerCase())
      )
    : inventory

  const columns: Column<Inventory>[] = [
    {
      key: 'item_Code',
      label: 'Item Code',
      width: '220px',
    },
    {
      key: 'on_Hand_Quantity',
      label: 'On Hand',
      width: '120px',
      align: 'right',
      render: (value) => value?.toFixed(2) || '0.00',
    },
    {
      key: 'available_Quantity',
      label: 'Available',
      width: '120px',
      align: 'right',
      render: (value) => value?.toFixed(2) || '0.00',
    },
  ]

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

      {/* Search Bar */}
      <div className="flex-shrink-0">
        <div className="relative">
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
