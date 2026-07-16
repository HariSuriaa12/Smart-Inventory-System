import { useState, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAllLocations } from '@/store/slices/locationSlice'
import { fetchItems } from '@/store/slices/itemSlice'
import { stockTransferService } from '@/services/stockTransferService'
import { inventoryService } from '@/services/inventoryService'
import { X, AlertCircle, Search } from 'lucide-react'

interface CreateStockTransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ItemOption {
  id: number
  code: string
  name: string
  availableQty: number
}

export const CreateStockTransferModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateStockTransferModalProps) => {
  const dispatch = useAppDispatch()
  const { locations } = useAppSelector((state) => state.locations)
  const { items } = useAppSelector((state) => state.items)
  const { currentLocation } = useAppSelector((state) => state.locations)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null)
  const [toLocation, setToLocation] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [remark, setRemark] = useState('')
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [availableQuantity, setAvailableQuantity] = useState<number>(0)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllLocations() as any)
      dispatch(fetchItems({ skip: 0, take: 500 }) as any)
      setSelectedItem(null)
      setToLocation('')
      setQuantity('')
      setRemark('')
      setSearchQuery('')
      setAvailableQuantity(0)
      setError('')
    }
  }, [isOpen, dispatch])

  // Fetch available quantity when item and location are selected
  useEffect(() => {
    const fetchAvailableQty = async () => {
      if (selectedItem && currentLocation) {
        try {
          const response = await inventoryService.getByItemAndLocation(
            selectedItem.id,
            currentLocation.id
          )
          setAvailableQuantity(response.data?.available_Quantity || 0)
        } catch (err) {
          setAvailableQuantity(0)
        }
      }
    }

    fetchAvailableQty()
  }, [selectedItem, currentLocation])

  const filteredItems: ItemOption[] = useMemo(() => {
    if (!items || items.length === 0) return []

    return items
      .filter((item) => {
        const query = searchQuery.toLowerCase()
        return (
          item.item_Code?.toLowerCase().includes(query) ||
          item.item_Name?.toLowerCase().includes(query)
        )
      })
      .map((item) => ({
        id: item.id,
        code: item.item_Code || '',
        name: item.item_Name || '',
        availableQty: 0,
      }))
  }, [items, searchQuery])

  const handleSelectItem = (item: ItemOption) => {
    setSelectedItem(item)
    setSearchQuery(item.code)
    setShowItemDropdown(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem || !toLocation || quantity === '' || !currentLocation) {
      setError('Please fill in all required fields')
      return
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Transfer quantity must be a positive number')
      return
    }

    if (qty > availableQuantity) {
      setError(`Cannot transfer more than available quantity (${availableQuantity.toFixed(2)})`)
      return
    }

    if (parseInt(toLocation) === currentLocation.id) {
      setError('Cannot transfer to the same location')
      return
    }

    setLoading(true)
    setError('')

    try {
      await stockTransferService.createStockTransfer({
        From_Location_ID: currentLocation.id,
        To_Location_ID: parseInt(toLocation),
        Item_ID: selectedItem.id,
        Transfer_Quantity: qty,
        Remark: remark || undefined,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create stock transfer')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const availableLocations = locations.filter(
    (loc) => loc.id !== currentLocation?.id
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Create Stock Transfer</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Item <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by item code or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowItemDropdown(true)
                    if (selectedItem && e.target.value !== selectedItem.code) {
                      setSelectedItem(null)
                      setAvailableQuantity(0)
                    }
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              {/* Item Dropdown */}
              {showItemDropdown && filteredItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{item.code}</p>
                      <p className="text-sm text-gray-600">{item.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedItem && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  {selectedItem.code} - {selectedItem.name}
                </p>
              </div>
            )}
          </div>

          {/* Available Quantity */}
          {selectedItem && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 uppercase">Available to Transfer</p>
              <p className="text-lg font-semibold text-blue-900">
                {availableQuantity.toFixed(2)}
              </p>
            </div>
          )}

          {/* From Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              From Location
            </label>
            <input
              type="text"
              value={currentLocation?.location_Name || 'N/A'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* To Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Transfer To <span className="text-red-500">*</span>
            </label>
            <select
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              disabled={loading || !selectedItem}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            >
              <option value="">-- Select location --</option>
              {availableLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              disabled={loading || !selectedItem}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 text-right"
            />
          </div>

          {/* Remark */}
          <div>
            <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1.5">
              Remark (Optional)
            </label>
            <textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add any notes about this transfer..."
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 justify-end bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedItem}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Transfer'}
          </button>
        </div>
      </div>
    </div>
  )
}
