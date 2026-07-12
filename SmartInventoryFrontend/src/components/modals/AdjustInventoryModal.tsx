import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { adjustInventory } from '@/store/slices/inventorySlice'
import { Inventory, AdjustInventoryRequest } from '@/types/inventory'
import { X, AlertCircle } from 'lucide-react'

interface AdjustInventoryModalProps {
  isOpen: boolean
  inventory: Inventory | null
  onClose: () => void
  onSuccess: () => void
}

export const AdjustInventoryModal = ({
  isOpen,
  inventory,
  onClose,
  onSuccess,
}: AdjustInventoryModalProps) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adjustment, setAdjustment] = useState<string>('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setAdjustment('')
      setRemark('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inventory || adjustment === '') {
      setError('Please enter an adjustment quantity')
      return
    }

    const qty = parseFloat(adjustment)
    if (isNaN(qty)) {
      setError('Adjustment must be a valid number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const request: AdjustInventoryRequest = {
        Item_ID: inventory.Item_ID,
        Location_ID: inventory.Location_ID,
        QuantityAdjustment: qty,
        Remark: remark || undefined,
      }

      await dispatch(adjustInventory(request) as any)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to adjust inventory')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Adjust Inventory</h2>
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
            <p className="text-base font-semibold text-gray-900">{inventory?.Item_Name}</p>
          </div>

          {/* Current Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase">On Hand</p>
              <p className="text-lg font-semibold text-gray-900">
                {inventory?.OnHand_Quantity?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase">Available</p>
              <p className="text-lg font-semibold text-gray-900">
                {inventory?.Available_Quantity?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Adjustment Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantity Adjustment
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              placeholder="e.g., 10 (add) or -5 (subtract)"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Positive to add, negative to subtract</p>
          </div>

          {/* Remark Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Remark (Optional)
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Reason for adjustment..."
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
            {loading ? 'Adjusting...' : 'Adjust Inventory'}
          </button>
        </div>
      </div>
    </div>
  )
}
