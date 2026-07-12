import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { transferStock } from '@/store/slices/inventorySlice'
import { fetchAllLocations } from '@/store/slices/locationSlice'
import { Inventory, StockTransferRequest } from '@/types/inventory'
import { X, AlertCircle } from 'lucide-react'

interface StockTransferModalProps {
  isOpen: boolean
  inventory: Inventory | null
  currentLocation: number | null
  onClose: () => void
  onSuccess: () => void
}

export const StockTransferModal = ({
  isOpen,
  inventory,
  currentLocation,
  onClose,
  onSuccess,
}: StockTransferModalProps) => {
  const dispatch = useAppDispatch()
  const { locations } = useAppSelector((state) => state.locations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toLocation, setToLocation] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (isOpen && locations.length === 0) {
      dispatch(fetchAllLocations() as any)
    }
  }, [isOpen, locations.length, dispatch])

  useEffect(() => {
    if (!isOpen) {
      setToLocation('')
      setQuantity('')
      setRemark('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inventory || !toLocation || quantity === '') {
      setError('Please fill in all required fields')
      return
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Transfer quantity must be a positive number')
      return
    }

    if (qty > (inventory?.available_Quantity || 0)) {
      setError(`Cannot transfer more than available quantity (${inventory?.available_Quantity?.toFixed(2)})`)
      return
    }

    if (parseInt(toLocation) === inventory.location_ID) {
      setError('Cannot transfer to the same location')
      return
    }

    setLoading(true)
    setError('')

    try {
      const request: StockTransferRequest = {
        From_Location_ID: inventory.location_ID,
        To_Location_ID: parseInt(toLocation),
        Item_ID: inventory.item_ID,
        Transfer_Quantity: qty,
        Remark: remark || undefined,
      }

      await dispatch(transferStock(request) as any)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to transfer stock')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const availableLocations = locations.filter((loc) => loc.id !== currentLocation)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transfer Stock</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Item</p>
            <p className="text-base font-semibold text-gray-900">{inventory?.item?.item_Code || '-'}</p>
          </div>

          {/* Available Quantity */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 uppercase">Available to Transfer</p>
            <p className="text-lg font-semibold text-blue-900">
              {inventory?.available_Quantity?.toFixed(2) || '0.00'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* To Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Transfer To
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              disabled={loading}
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

          {/* Transfer Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantity to Transfer
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={inventory?.available_Quantity || 0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          {/* Remark Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Remark (Optional)
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Reason for transfer..."
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-50"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? 'Transferring...' : 'Transfer Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}
