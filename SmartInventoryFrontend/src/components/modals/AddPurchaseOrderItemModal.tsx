import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components'
import { itemService } from '@/services/itemService'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { Item } from '@/types/item'

interface AddPurchaseOrderItemModalProps {
  isOpen: boolean
  poId: number
  onClose: () => void
  onSuccess: () => void
  isLoading?: boolean
}

export const AddPurchaseOrderItemModal = ({ isOpen, poId, onClose, onSuccess, isLoading = false }: AddPurchaseOrderItemModalProps) => {
  const [itemSearch, setItemSearch] = useState('')
  const [itemSearchResults, setItemSearchResults] = useState<Item[]>([])
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [orderQuantity, setOrderQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchingItems, setSearchingItems] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSearchItems = useCallback(async (query: string) => {
    if (query.length < 2) {
      setItemSearchResults([])
      return
    }
    setSearchingItems(true)
    try {
      const response = await itemService.getItems(0, 50, query)
      setItemSearchResults(response.data?.data || [])
    } catch (error) {
      console.error('Failed to search items:', error)
    } finally {
      setSearchingItems(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearchItems(itemSearch)
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [itemSearch, handleSearchItems])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!selectedItem) newErrors.item = 'Please select an item'
    const qty = parseFloat(orderQuantity)
    if (isNaN(qty) || qty <= 0) newErrors.orderQuantity = 'Quantity must be greater than 0'
    const price = parseFloat(unitPrice)
    if (isNaN(price) || price <= 0) newErrors.unitPrice = 'Unit price must be greater than 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [selectedItem, orderQuantity, unitPrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !selectedItem) return

    setSubmitting(true)
    try {
      await purchaseOrderService.addItemToPO(poId, {
        Item_ID: selectedItem.id,
        Order_Quantity: parseFloat(orderQuantity),
        Unit_Price: parseFloat(unitPrice),
      })
      handleReset()
      onSuccess()
    } catch (error) {
      console.error('Failed to add item:', error)
      setErrors((prev) => ({ ...prev, submit: 'Failed to add item to purchase order' }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setItemSearch('')
    setSelectedItem(null)
    setOrderQuantity('1')
    setUnitPrice('')
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  if (!isOpen) return null

  const totalAmount = (parseFloat(orderQuantity) || 0) * (parseFloat(unitPrice) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Item to Purchase Order</h2>
          <button onClick={handleClose} disabled={isLoading || submitting} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedItem ? `${selectedItem.item_Code} - ${selectedItem.item_Name}` : itemSearch}
              onChange={(e) => {
                if (selectedItem) setSelectedItem(null)
                setItemSearch(e.target.value)
                setShowItemDropdown(true)
              }}
              placeholder="Search item by name or code"
              disabled={isLoading || submitting || searchingItems || !!selectedItem}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            />
            {selectedItem && (
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null)
                  setItemSearch('')
                }}
                disabled={isLoading || submitting}
                className="mt-1 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
              >
                Change Selection
              </button>
            )}
            {showItemDropdown && !selectedItem && itemSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {itemSearchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(item)
                      setShowItemDropdown(false)
                      setItemSearch('')
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{item.item_Code}</div>
                    <div className="text-sm text-gray-600">{item.item_Name}</div>
                  </button>
                ))}
              </div>
            )}
            {errors.item && <p className="text-sm text-red-600 mt-1">{errors.item}</p>}
          </div>

          {/* Item Details */}
          {selectedItem && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Selected Item Details</p>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{selectedItem.item_Name}</p>
                <p className="text-sm text-gray-600">Code: {selectedItem.item_Code}</p>
                <p className="text-sm text-gray-600">Category: {selectedItem.item_Category}</p>
                <p className="text-sm text-gray-600">UOM: {selectedItem.unit_Of_Measure}</p>
              </div>
            </div>
          )}

          {/* Quantity and Price */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={orderQuantity}
                onChange={(e) => {
                  setOrderQuantity(e.target.value)
                  if (errors.orderQuantity) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.orderQuantity
                      return newErrors
                    })
                  }
                }}
                placeholder="Enter quantity"
                min="0.01"
                step="0.01"
                disabled={isLoading || submitting}
                error={errors.orderQuantity}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(e.target.value)
                  if (errors.unitPrice) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.unitPrice
                      return newErrors
                    })
                  }
                }}
                placeholder="Enter unit price"
                min="0.01"
                step="0.01"
                disabled={isLoading || submitting}
                error={errors.unitPrice}
              />
            </div>
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || submitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || submitting || !selectedItem}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
