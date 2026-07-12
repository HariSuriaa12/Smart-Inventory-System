import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components'
import { CreateLocationRequest } from '@/types/location'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLocationRequest) => Promise<void>
  isLoading?: boolean
}

const LOCATION_TYPES = [
  'Main Office',
  'Warehouse',
  'Retail Store',
  'Distribution Center',
  'Branch',
]

export const AddLocationModal = ({ isOpen, onClose, onSubmit, isLoading = false }: AddLocationModalProps) => {
  const [formData, setFormData] = useState<CreateLocationRequest>({
    location_Name: '',
    outlet_Code: '',
    location_Type: 1,
    address: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.location_Name.trim()) newErrors.location_Name = 'Location name is required'
    if (!formData.outlet_Code.trim()) newErrors.outlet_Code = 'Outlet code is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit(formData)
      setFormData({
        location_Name: '',
        outlet_Code: '',
        location_Type: 1,
        address: '',
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Failed to create location:', error)
    }
  }

  const handleInputChange = (field: keyof CreateLocationRequest, value: any) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Add New Location</h2>
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
          {/* Row 1: Outlet Code and Location Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outlet Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.outlet_Code}
                onChange={(e) => handleInputChange('outlet_Code', e.target.value)}
                placeholder="e.g., LOC-001"
                error={errors.outlet_Code}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.location_Name}
                onChange={(e) => handleInputChange('location_Name', e.target.value)}
                placeholder="e.g., Main Warehouse"
                error={errors.location_Name}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 2: Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.location_Type}
              onChange={(e) => handleInputChange('location_Type', parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 focus:border-transparent bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="1">Main Office</option>
              <option value="2">Warehouse</option>
              <option value="3">Retail Store</option>
              <option value="4">Distribution Center</option>
              <option value="5">Branch</option>
            </select>
          </div>

          {/* Row 3: Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter the location address..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 transition-colors ${
                errors.address
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-transparent'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              disabled={isLoading}
            />
            {errors.Address && <p className="text-red-500 text-sm mt-1">{errors.Address}</p>}
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
              {isLoading ? 'Creating...' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
