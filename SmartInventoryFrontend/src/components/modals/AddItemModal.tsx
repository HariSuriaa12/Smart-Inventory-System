import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components'
import { CreateItemRequest } from '@/types/item'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateItemRequest) => Promise<void>
  isLoading?: boolean
}

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Food & Beverage',
  'Office Supplies',
  'Tools',
  'Other'
]

const TAX_TYPES = [
  'GST',
  'VAT',
  'Sales Tax',
  'None'
]

export const AddItemModal = ({ isOpen, onClose, onSubmit, isLoading = false }: AddItemModalProps) => {
  const [formData, setFormData] = useState<CreateItemRequest>({
    Item_Name: '',
    Item_Code: '',
    Description: '',
    Item_Category: '',
    Item_Brand: '',
    Purchase_Cost: 0,
    Unit_Cost: 0,
    Is_Active: true,
    Unit_Of_Measure: 'Pieces',
    Remark: '',
    Item_Image_Url: '',
    Tax_Percentage: 0,
    Tax_Type: 'GST',
    Item_Type: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.Item_Name.trim()) newErrors.Item_Name = 'Item name is required'
    if (!formData.Item_Code.trim()) newErrors.Item_Code = 'Item code is required'
    if (!formData.Item_Category) newErrors.Item_Category = 'Category is required'
    if (formData.Purchase_Cost < 0) newErrors.Purchase_Cost = 'Purchase cost cannot be negative'
    if (formData.Unit_Cost < 0) newErrors.Unit_Cost = 'Unit cost cannot be negative'
    if (formData.Tax_Percentage < 0 || formData.Tax_Percentage > 100) {
      newErrors.Tax_Percentage = 'Tax percentage must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit(formData)
      setFormData({
        Item_Name: '',
        Item_Code: '',
        Description: '',
        Item_Category: '',
        Item_Brand: '',
        Purchase_Cost: 0,
        Unit_Cost: 0,
        Is_Active: true,
        Unit_Of_Measure: 'Pieces',
        Remark: '',
        Item_Image_Url: '',
        Tax_Percentage: 0,
        Tax_Type: 'GST',
        Item_Type: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  const handleInputChange = (field: keyof CreateItemRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Item Code and Item Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.Item_Code}
                onChange={(e) => handleInputChange('Item_Code', e.target.value)}
                placeholder="e.g., WID-001"
                error={errors.Item_Code}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.Item_Name}
                onChange={(e) => handleInputChange('Item_Name', e.target.value)}
                placeholder="e.g., Widget A"
                error={errors.Item_Name}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 2: Category and Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.Item_Category}
                onChange={(e) => handleInputChange('Item_Category', e.target.value)}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white transition-colors ${
                  errors.Item_Category
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.Item_Category && <p className="text-red-500 text-sm mt-1">{errors.Item_Category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <Input
                type="text"
                value={formData.Item_Brand}
                onChange={(e) => handleInputChange('Item_Brand', e.target.value)}
                placeholder="e.g., Acme Corp"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              placeholder="Item description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Row 4: Purchase Cost and Unit Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Cost <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.Purchase_Cost}
                onChange={(e) => handleInputChange('Purchase_Cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                error={errors.Purchase_Cost}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.Unit_Cost}
                onChange={(e) => handleInputChange('Unit_Cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                error={errors.Unit_Cost}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 5: Unit of Measure and Tax Percentage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
              <Input
                type="text"
                value={formData.Unit_Of_Measure}
                onChange={(e) => handleInputChange('Unit_Of_Measure', e.target.value)}
                placeholder="e.g., Pieces, KG, Liter"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percentage</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.Tax_Percentage}
                onChange={(e) => handleInputChange('Tax_Percentage', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                error={errors.Tax_Percentage}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 6: Tax Type and Item Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
              <select
                value={formData.Tax_Type}
                onChange={(e) => handleInputChange('Tax_Type', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 focus:border-transparent bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {TAX_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
              <Input
                type="text"
                value={formData.Item_Type}
                onChange={(e) => handleInputChange('Item_Type', e.target.value)}
                placeholder="e.g., Product, Service"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 7: Remarks and Active Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <Input
                type="text"
                value={formData.Remark}
                onChange={(e) => handleInputChange('Remark', e.target.value)}
                placeholder="Any additional remarks"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <Input
                type="url"
                value={formData.Item_Image_Url}
                onChange={(e) => handleInputChange('Item_Image_Url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.Is_Active}
              onChange={(e) => handleInputChange('Is_Active', e.target.checked)}
              disabled={isLoading}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
              Active
            </label>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
