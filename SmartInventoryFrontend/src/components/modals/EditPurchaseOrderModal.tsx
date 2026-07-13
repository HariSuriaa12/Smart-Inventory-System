import { useState, useCallback, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updatePO } from '@/store/slices/purchaseOrderSlice'
import { X } from 'lucide-react'
import { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseorder'

interface EditPurchaseOrderModalProps {
  isOpen: boolean
  po: PurchaseOrder | null
  onClose: () => void
  onSuccess: () => void
  isLoading?: boolean
}

export const EditPurchaseOrderModal = ({ isOpen, po, onClose, onSuccess, isLoading = false }: EditPurchaseOrderModalProps) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    remark: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (po && isOpen) {
      setFormData({
        remark: po.remark || '',
      })
      setErrors({})
    }
  }, [po, isOpen])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    setErrors(newErrors)
    return true
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!po || !validateForm()) return

    try {
      await dispatch(updatePO({ id: po.id, data: { remark: formData.remark } }) as any)
      onSuccess()
    } catch (error) {
      console.error('Failed to update purchase order:', error)
    }
  }

  if (!isOpen || !po) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Purchase Order</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              Only remarks and status can be edited for <strong>Saved</strong> purchase orders. To add or remove items, create a new purchase order.
            </p>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
            <textarea
              value={formData.remark}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, remark: e.target.value }))
                if (errors.remark) {
                  setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.remark
                    return newErrors
                  })
                }
              }}
              placeholder="Add or update remarks for this purchase order"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
              rows={4}
            />
            {errors.remark && <p className="text-sm text-red-600 mt-1">{errors.remark}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
