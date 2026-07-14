import { useState, useCallback, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Input } from '@/components'
import { orderFulfillmentService } from '@/services/orderFulfillmentService'
import { OrderFulfillmentItem, OrderFulfillmentStatus, OrderFulfillmentStatusLabel } from '@/types/orderfulfillment'

interface ShipItemModalProps {
  isOpen: boolean
  fulfillmentId: number
  item: OrderFulfillmentItem | null
  onClose: () => void
  onSuccess: () => void
  isLoading?: boolean
}

export const ShipItemModal = ({ isOpen, fulfillmentId, item, onClose, onSuccess, isLoading = false }: ShipItemModalProps) => {
  const [shippedQuantity, setShippedQuantity] = useState('')
  const [requestQuantity, setRequestQuantity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && item) {
      setShippedQuantity(item.shipped_Quantity?.toString() || '0')
      setRequestQuantity(item.request_Quantity?.toString() || '0')
      setErrors({})
    }
  }, [isOpen, item])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    const shipped = parseFloat(shippedQuantity)

    if (isNaN(shipped) || shipped < 0) {
      newErrors.shippedQuantity = 'Shipped quantity must be non-negative'
    }
    if (shipped > item!.request_Quantity) {
      newErrors.shippedQuantity = `Shipped quantity cannot exceed requested quantity (${item!.request_Quantity})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [shippedQuantity, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !validateForm()) return

    setSubmitting(true)
    try {
      await orderFulfillmentService.shipItem(fulfillmentId, item.id, parseFloat(shippedQuantity))
      onSuccess()
    } catch (error) {
      console.error('Failed to ship item:', error)
      setErrors((prev) => ({ ...prev, submit: 'Failed to ship item' }))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !item) return null

  const remainingToShip = item.request_Quantity - item.shipped_Quantity
  const isFullyShipped = item.shipped_Quantity >= item.request_Quantity
  const isItemFulfilled = item.status === OrderFulfillmentStatus.Fulfilled

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Ship Item</h2>
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
                <span className="text-gray-700">Request Quantity:</span>
                <span className="font-medium text-gray-900">{item.request_Quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Previously Shipped:</span>
                <span className="font-medium text-gray-900">{item.shipped_Quantity}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Remaining to Ship:</span>
                <span className={`font-bold ${remainingToShip > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {remainingToShip}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          {item.status !== OrderFulfillmentStatus.Verified && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <p className="font-medium text-gray-900">{OrderFulfillmentStatusLabel[item.status]}</p>
            </div>
          )}

          {/* Warning if fully shipped */}
          {isItemFulfilled && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">This item has been fully shipped</p>
              </div>
            </div>
          )}

          {/* Shipped Quantity Input */}
          {!isFullyShipped && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipped Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={shippedQuantity}
                onChange={(e) => {
                  setShippedQuantity(e.target.value)
                  if (errors.shippedQuantity) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.shippedQuantity
                      return newErrors
                    })
                  }
                }}
                placeholder="Enter shipped quantity"
                min="0"
                step="0.01"
                max={remainingToShip}
                disabled={isLoading || submitting || isItemFulfilled}
                error={errors.shippedQuantity}
              />
              <p className="text-xs text-gray-500 mt-2">Maximum: {remainingToShip}</p>
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
              <strong>Note:</strong> Updating shipped quantity will automatically update the order fulfillment status based on the total shipped amount for all items.
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
              disabled={isLoading || submitting || isItemFulfilled}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {submitting ? 'Updating...' : 'Update Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
