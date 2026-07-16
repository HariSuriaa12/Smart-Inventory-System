import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { receiveStock } from '@/store/slices/stockTransferSlice'
import { StockTransfer } from '@/types/stocktransfer'
import { X, AlertCircle } from 'lucide-react'

interface ReceivedQuantityModalProps {
  isOpen: boolean
  transfer: StockTransfer
  onClose: () => void
  onSuccess: () => void
}

export const ReceivedQuantityModal = ({
  isOpen,
  transfer,
  onClose,
  onSuccess,
}: ReceivedQuantityModalProps) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receivedQty, setReceivedQty] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setReceivedQty(transfer.received_Quantity.toString())
      setError('')
    }
  }, [isOpen, transfer])

  const remainingQty = transfer.transfer_Quantity - transfer.received_Quantity

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (receivedQty === '') {
      setError('Please enter received quantity')
      return
    }

    const qty = parseFloat(receivedQty)
    if (isNaN(qty) || qty < 0) {
      setError('Received quantity must be a non-negative number')
      return
    }

    if (qty + transfer.received_Quantity > transfer.transfer_Quantity) {
      setError(`Total received quantity cannot exceed transfer quantity (${transfer.transfer_Quantity.toFixed(2)})`)
      return
    }

    setLoading(true)
    setError('')

    try {
      await dispatch(receiveStock({
        id: transfer.id,
        receivedQuantity: qty,
        remark: '',
      }) as any)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to receive stock')
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
          <h2 className="text-xl font-bold text-gray-900">Receive Stock</h2>
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
          {error && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transfer ID
            </label>
            <input
              type="text"
              value={transfer.id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item
            </label>
            <input
              type="text"
              value={transfer.item_Name || '-'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer Qty
              </label>
              <input
                type="text"
                value={transfer.transfer_Quantity.toFixed(2)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Already Received
              </label>
              <input
                type="text"
                value={transfer.received_Quantity.toFixed(2)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-right"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Remaining to receive: </span>
              {remainingQty.toFixed(2)}
            </p>
          </div>

          <div>
            <label htmlFor="receivedQty" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Receive Now <span className="text-red-500">*</span>
            </label>
            <input
              id="receivedQty"
              type="number"
              step="0.01"
              min="0"
              max={remainingQty}
              value={receivedQty}
              onChange={(e) => setReceivedQty(e.target.value)}
              placeholder={`Max: ${remainingQty.toFixed(2)}`}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 text-right"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 justify-end bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Receive'}
          </button>
        </div>
      </div>
    </div>
  )
}
