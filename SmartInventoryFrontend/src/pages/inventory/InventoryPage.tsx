import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchInventoryByLocation, clearError } from '@/store/slices/inventorySlice'
import { fetchLocations } from '@/store/slices/locationSlice'
import { DataGrid, Card, Column } from '@/components'
import { AdjustInventoryModal } from '@/components/modals/AdjustInventoryModal'
import { StockTransferModal } from '@/components/modals/StockTransferModal'
import { Inventory } from '@/types/inventory'
import { Location } from '@/types/location'
import { Search, X, ArrowRightLeft, Edit2 } from 'lucide-react'

const PAGE_SIZE = 10

export const InventoryPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)

  const { inventory, loading, error } = useAppSelector((state) => state.inventory)
  const { locations } = useAppSelector((state) => state.locations)

  // Fetch locations on mount
  useEffect(() => {
    dispatch(fetchLocations({ skip: 0, take: 100 }) as any)
  }, [dispatch])

  // Fetch inventory when location or page changes
  useEffect(() => {
    if (selectedLocation) {
      const skip = (currentPage - 1) * PAGE_SIZE
      dispatch(fetchInventoryByLocation({ locationId: selectedLocation, skip, take: PAGE_SIZE }) as any)
    }
  }, [selectedLocation, currentPage, dispatch])

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value ? parseInt(e.target.value) : null
    setSelectedLocation(locId)
    setCurrentPage(1)
    setSearchInput('')
  }, [])

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
    if (selectedLocation) {
      dispatch(fetchInventoryByLocation({ locationId: selectedLocation, skip: 0, take: PAGE_SIZE }) as any)
    }
  }, [selectedLocation, dispatch])

  const handleTransferSuccess = useCallback(() => {
    setIsTransferOpen(false)
    setSelectedInventory(null)
    if (selectedLocation) {
      dispatch(fetchInventoryByLocation({ locationId: selectedLocation, skip: 0, take: PAGE_SIZE }) as any)
    }
  }, [selectedLocation, dispatch])

  const filteredInventory = searchInput.trim()
    ? inventory.filter((item) =>
        item.Item_Name?.toLowerCase().includes(searchInput.toLowerCase())
      )
    : inventory

  const columns: Column<Inventory>[] = [
    {
      key: 'Item_Name',
      label: 'Item Name',
      width: '220px',
    },
    {
      key: 'OnHand_Quantity',
      label: 'On Hand',
      width: '120px',
      align: 'right',
      render: (value) => value?.toFixed(2) || '0.00',
    },
    {
      key: 'Available_Quantity',
      label: 'Available',
      width: '120px',
      align: 'right',
      render: (value) => value?.toFixed(2) || '0.00',
    },
  ]

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">View and manage inventory by location</p>
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

      {/* Location Selection */}
      <div className="flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Location</label>
        <select
          value={selectedLocation || ''}
          onChange={handleLocationChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">-- Choose a location --</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.location_Name}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      {selectedLocation && (
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
      )}

      {/* Data Grid */}
      {selectedLocation ? (
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
      ) : (
        <Card className="flex-1 flex items-center justify-center p-6">
          <p className="text-gray-500">Please select a location to view inventory</p>
        </Card>
      )}

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
        currentLocation={selectedLocation}
        onClose={() => {
          setIsTransferOpen(false)
          setSelectedInventory(null)
        }}
        onSuccess={handleTransferSuccess}
      />
    </div>
  )
}
