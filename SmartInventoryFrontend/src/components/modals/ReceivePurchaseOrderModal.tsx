import { useState, useCallback, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Input } from '@/components'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { PurchaseOrderItem, PurchaseOrderStatus, PurchaseOrderStatusLabel } from '@/types/purchaseorder'

interface ReceivePurchaseOrderModalProps {
  isOpen: boolean
  poId: number
  item: PurchaseOrderItem | null
  onClose: () => void
  onSuccess: () => void
  isLoading?: boolean
}

export const ReceivePurchaseOrderModal = ({ isOpen, poId, item, onClose, onSuccess, isLoading = false }: ReceivePurchaseOrderModalProps) => {
  const [receivedQuantity, setReceivedQuantity] = useState('')
  const [orderedQuantity, setOrderedQuantity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && item) {
      setReceivedQuantity(item.received_Quantity?.toString() || '0')
      setOrderedQuantity(item.order_Quantity?.toString() || '0')
      setErrors({})
    }
  }, [isOpen, item])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    const received = parseFloat(receivedQuantity)

    if (isNaN(received) || received < 0) {
      newErrors.receivedQuantity = 'Received quantity must be non-negative'
    }
    if (received > item!.order_Quantity) {
      newErrors.receivedQuantity = `Received quantity cannot exceed ordered quantity (${item!.order_Quantity})`
    }
    if (received > (item!.order_Quantity - item!.received_Quantity)) {
      newErrors.receivedQuantity = `Received quantity cannot exceed remaining quantity (${(item!.order_Quantity - item!.received_Quantity)})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [receivedQuantity, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !validateForm()) return

    setSubmitting(true)
    try {
      await purchaseOrderService.receiveItem(poId, item.id, parseFloat(receivedQuantity))
      onSuccess()
    } catch (error) {
      console.error('Failed to receive item:', error)
      setErrors((prev) => ({ ...prev, submit: 'Failed to receive item' }))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !item) return null

  const remainingToReceive = item.order_Quantity - item.received_Quantity
  const isFullyReceived = item.received_Quantity >= item.order_Quantity
  const isItemReceived = item.status === PurchaseOrderStatus.Received

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Receive Item</h2>
          <button onClick={onClose} disabled={isLoading || submitting} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Details */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Item Details</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Item Code:</span>
                <span className="font-medium text-gray-900">{item.item_Code || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Item Name:</span>
                <span className="font-medium text-gray-900">{item.item_Name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Order Quantity:</span>
                <span className="font-medium text-gray-900">{item.order_Quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Previously Received:</span>
                <span className="font-medium text-gray-900">{item.received_Quantity}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Remaining to Receive:</span>
                <span className={`font-bold ${remainingToReceive > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {remainingToReceive}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          {item.status !== PurchaseOrderStatus.Pending && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <p className="font-medium text-gray-900">{PurchaseOrderStatusLabel[item.status]}</p>
            </div>
          )}

          {/* Warning if fully received */}
          {isItemReceived && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">This item has been fully received</p>
                {/* <p className="text-sm text-red-700">The received quantity cannot be modified for fully received items</p> */}
              </div>
            </div>
          )}

          {/* {isFullyReceived && !isItemReceived && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex gap-3">
              <AlertCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">This item has been fully received</p>
                <p className="text-sm text-green-700">You can still update the received quantity if needed</p>
              </div>
            </div>
          )} */}

          {/* Received Quantity Input */}
          {!isFullyReceived && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={receivedQuantity}
                onChange={(e) => {
                  setReceivedQuantity(e.target.value)
                  if (errors.receivedQuantity) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.receivedQuantity
                      return newErrors
                    })
                  }
                }}
                placeholder="Enter received quantity"
                min="0"
                step="0.01"
                max={remainingToReceive}
                disabled={isLoading || submitting || isItemReceived}
                error={errors.receivedQuantity}
              />
              {/* <p className="text-xs text-gray-500 mt-2">Maximum: {item.order_Quantity}</p> */}
              <p className="text-xs text-gray-500 mt-2">Maximum: {remainingToReceive}</p>
            </div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Updating received quantity will automatically update the purchase order status based on the total received amount for all items.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || submitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || submitting || isItemReceived}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {submitting ? 'Updating...' : 'Update Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
