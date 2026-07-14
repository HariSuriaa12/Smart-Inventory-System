import { useState, useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createPO } from '@/store/slices/purchaseOrderSlice'
import { fetchVendors } from '@/store/slices/vendorSlice'
import { fetchLocations } from '@/store/slices/locationSlice'
import { X } from 'lucide-react'
import { Input, Select } from '@/components'
import { itemService } from '@/services/itemService'
import { Item } from '@/types/item'
import { CreatePurchaseOrderRequest } from '@/types/purchaseorder'
import { Vendor } from '@/types/vendor'
import { Location } from '@/types/location'

interface CreatePurchaseOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  isLoading?: boolean
}

interface SelectedItem {
  item: Item
  orderQuantity: number
  unitPrice: number
}

export const CreatePurchaseOrderModal = ({ isOpen, onClose, onSuccess, isLoading = false }: CreatePurchaseOrderModalProps) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    poRefNo: '',
    locationId: '',
    vendorId: '',
    remark: '',
  })
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [itemSearch, setItemSearch] = useState('')
  const [itemSearchResults, setItemSearchResults] = useState<Item[]>([])
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [currentItemQty, setCurrentItemQty] = useState('1')
  const [currentItemPrice, setCurrentItemPrice] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchingItems, setSearchingItems] = useState(false)

  const { vendors } = useAppSelector((state) => state.vendors)
  const { locations } = useAppSelector((state) => state.locations)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchVendors({ skip: 0, take: 100 }) as any)
      dispatch(fetchLocations({ skip: 0, take: 100 }) as any)
      // Set default location if available
      if (locations && locations.length > 0 && !formData.locationId) {
        setFormData((prev) => ({ ...prev, locationId: locations[0].id.toString() }))
      }
    }
  }, [isOpen, dispatch, locations])

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
    if (!formData.poRefNo) newErrors.poRefNo = 'PO Reference No is required'
    if (!formData.locationId) newErrors.locationId = 'Location is required'
    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required'
    if (selectedItems.length === 0) newErrors.items = 'At least one item is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, selectedItems])

  const handleAddItem = useCallback(() => {
    if (!itemSearch) {
      setErrors((prev) => ({ ...prev, item: 'Please select an item' }))
      return
    }

    console.log('Item search value:', itemSearch)
    const selectedItem = itemSearchResults.find((i) => i.item_Name === itemSearch || i.item_Code === itemSearch)
    if (!selectedItem) {
      setErrors((prev) => ({ ...prev, item: 'Please select a valid item' }))
      return
    }

    const qty = parseFloat(currentItemQty)
    const price = parseFloat(currentItemPrice)

    if (isNaN(qty) || qty <= 0) {
      setErrors((prev) => ({ ...prev, itemQty: 'Quantity must be greater than 0' }))
      return
    }
    if (isNaN(price) || price <= 0) {
      setErrors((prev) => ({ ...prev, itemPrice: 'Unit price must be greater than 0' }))
      return
    }

    // Check if item already added
    if (selectedItems.some((si) => si.item.id === selectedItem.id)) {
      setErrors((prev) => ({ ...prev, item: 'This item is already added' }))
      return
    }

    setSelectedItems((prev) => [...prev, { item: selectedItem, orderQuantity: qty, unitPrice: price }])
    setItemSearch('')
    setCurrentItemQty('1')
    setCurrentItemPrice('')
    setShowItemDropdown(false)
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.item
      delete newErrors.itemQty
      delete newErrors.itemPrice
      return newErrors
    })
  }, [itemSearch, itemSearchResults, currentItemQty, currentItemPrice, selectedItems])

  const handleRemoveItem = useCallback((index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const request: CreatePurchaseOrderRequest = {
        PO_Reference_No: formData.poRefNo,
        Location_Id: Number(formData.locationId),
        Vendor_Id: Number(formData.vendorId),
        // purchaseDate: new Date().toISOString(),
        // purchaseTime: new Date().toTimeString().slice(0, 5),
        Remark: formData.remark || undefined,
        Items: selectedItems.map((si) => ({
          Item_ID: si.item.id,
          Order_Quantity: si.orderQuantity,
          Unit_Price: si.unitPrice,
        })),
      }
      await dispatch(createPO(request) as any)
      handleReset()
      onSuccess()
    } catch (error) {
      console.error('Failed to create purchase order:', error)
    }
  }

  const handleReset = () => {
    setFormData({ poRefNo: '', locationId: locations && locations.length > 0 ? locations[0].id.toString() : '', vendorId: '', remark: '' })
    setSelectedItems([])
    setItemSearch('')
    setCurrentItemQty('1')
    setCurrentItemPrice('')
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const totalAmount = selectedItems.reduce((sum, si) => sum + si.orderQuantity * si.unitPrice, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Create Purchase Order</h2>
          <button onClick={handleClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PO Reference and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Reference No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.poRefNo}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, poRefNo: e.target.value }))
                  setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.poRefNo
                    return newErrors
                  })
                }}
                placeholder="Enter PO reference number"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
              />
              {errors.poRefNo && <p className="text-sm text-red-600 mt-1">{errors.poRefNo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                <span className="text-gray-700">{locations && formData.locationId ? locations.find(l => l.id.toString() === formData.locationId)?.location_Name : 'Default Location'}</span>
              </div>
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.vendorId}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, vendorId: e.target.value }))
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  delete newErrors.vendorId
                  return newErrors
                })
              }}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
            >
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.company_Name}
                </option>
              ))}
            </select>
            {errors.vendorId && <p className="text-sm text-red-600 mt-1">{errors.vendorId}</p>}
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData((prev) => ({ ...prev, remark: e.target.value }))}
              placeholder="Add any notes about this purchase order"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
              rows={3}
            />
          </div>

          {/* Item Selection */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h3>
            <div className="space-y-3">
              {/* Item Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value)
                    setShowItemDropdown(true)
                  }}
                  placeholder="Search item by name or code"
                  disabled={isLoading || searchingItems}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                />
                {showItemDropdown && itemSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {itemSearchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          //setItemSearch(`${item.item_Code} - ${item.item_Name}`)
                          setItemSearch(`${item.item_Code}`)
                          setShowItemDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium">{item.item_Code}</div>
                        <div className="text-sm text-gray-600">{item.item_Name}</div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.item && <p className="text-sm text-red-600 mt-1">{errors.item}</p>}
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                  <Input
                    type="number"
                    value={currentItemQty}
                    onChange={(e) => setCurrentItemQty(e.target.value)}
                    placeholder="1"
                    min="1"
                    step="0.01"
                    disabled={isLoading}
                    error={errors.itemQty}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <Input
                    type="number"
                    value={currentItemPrice}
                    onChange={(e) => setCurrentItemPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                    error={errors.itemPrice}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={isLoading || searchingItems}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
            </div>
          </div>

          {/* Selected Items Table */}
          {selectedItems.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Items</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.item.item_Name}</p>
                      <p className="text-sm text-gray-600">{item.item.item_Code}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-sm text-gray-600">Qty: {item.orderQuantity}</p>
                        <p className="font-medium text-gray-900">${(item.orderQuantity * item.unitPrice).toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={isLoading}
                        className="px-3 py-1 text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedItems.length === 0}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {isLoading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
