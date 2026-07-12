import { useState, useCallback, useEffect, useMemo } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Input } from '@/components'
import { Location, UpdateLocationRequest } from '@/types/location'

interface EditLocationModalProps {
  isOpen: boolean
  location: Location | null
  onClose: () => void
  onUpdate: (data: UpdateLocationRequest) => Promise<void>
  onDelete: () => Promise<void>
  isLoading?: boolean
}

export const EditLocationModal = ({ isOpen, location, onClose, onUpdate, onDelete, isLoading = false }: EditLocationModalProps) => {
  const [formData, setFormData] = useState<UpdateLocationRequest>({
    location_Name: '',
    outlet_Code: '',
    location_Type: 1,
    address: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize form when location changes
  useEffect(() => {
    if (location) {
      setFormData({
        location_Name: location.location_Name || '',
        outlet_Code: location.outlet_Code || '',
        location_Type: location.location_Type || 1,
        address: location.address || '',
      })
      setErrors({})
    }
  }, [location])

  // Calculate changed fields (only send fields that differ from original)
  const changedFields = useMemo(() => {
    if (!location) return {}

    const changes: Partial<UpdateLocationRequest> = {}

    const fieldMap: Record<string, keyof Location> = {
      location_Name: 'location_Name',
      outlet_Code: 'outlet_Code',
      location_Type: 'location_Type',
      address: 'address',
    }

    Object.entries(fieldMap).forEach(([formKey, locationKey]) => {
      if (formData[formKey as keyof UpdateLocationRequest] !== location[locationKey]) {
        changes[formKey as keyof UpdateLocationRequest] = formData[formKey as keyof UpdateLocationRequest]
      }
    })

    return changes
  }, [location, formData])

  const hasChanges = Object.keys(changedFields).length > 0

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.location_Name?.trim()) newErrors.location_Name = 'Location name is required'
    if (!formData.outlet_Code?.trim()) newErrors.outlet_Code = 'Outlet code is required'
    if (!formData.address?.trim()) newErrors.address = 'Address is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !hasChanges) return

    try {
      await onUpdate(formData as UpdateLocationRequest)
      onClose()
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete()
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Failed to delete location:', error)
    }
  }

  const handleInputChange = (field: keyof UpdateLocationRequest, value: any) => {
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

  if (!isOpen || !location) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Location</h2>
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
                value={formData.outlet_Code || ''}
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
                value={formData.location_Name || ''}
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
              value={formData.location_Type || 1}
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
              value={formData.address || ''}
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

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">Are you sure you want to delete this location?</p>
              <p className="text-red-600 text-sm mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || showDeleteConfirm}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>

            <div className="flex-1" />

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
              disabled={isLoading || !hasChanges}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
