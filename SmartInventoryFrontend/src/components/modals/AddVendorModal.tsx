import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components'
import { CreateVendorRequest } from '@/types/vendor'

interface AddVendorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateVendorRequest) => Promise<void>
  isLoading?: boolean
}

export const AddVendorModal = ({ isOpen, onClose, onSubmit, isLoading = false }: AddVendorModalProps) => {
  const [formData, setFormData] = useState<CreateVendorRequest>({
    company_Name: '',
    vendor_Code: '',
    company_Address: '',
    email: '',
    mobile: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.company_Name.trim()) newErrors.company_Name = 'Company name is required'
    if (!formData.vendor_Code.trim()) newErrors.vendor_Code = 'Vendor code is required'
    if (!formData.company_Address.trim()) newErrors.company_Address = 'Company address is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit(formData)
      setFormData({
        company_Name: '',
        vendor_Code: '',
        company_Address: '',
        email: '',
        mobile: '',
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Failed to create vendor:', error)
    }
  }

  const handleInputChange = (field: keyof CreateVendorRequest, value: any) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Add New Vendor</h2>
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
          {/* Row 1: Vendor Code and Company Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.vendor_Code}
                onChange={(e) => handleInputChange('vendor_Code', e.target.value)}
                placeholder="e.g., VEN-001"
                error={errors.vendor_Code}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.company_Name}
                onChange={(e) => handleInputChange('company_Name', e.target.value)}
                placeholder="e.g., ABC Supplies Inc."
                error={errors.company_Name}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 2: Email and Mobile */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="e.g., contact@vendor.com"
                error={errors.email}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="e.g., +1-234-567-8900"
                error={errors.mobile}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 3: Company Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.company_Address}
              onChange={(e) => handleInputChange('company_Address', e.target.value)}
              placeholder="Enter the company address..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 transition-colors ${
                errors.company_Address
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-transparent'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              disabled={isLoading}
            />
            {errors.company_Address && <p className="text-red-500 text-sm mt-1">{errors.company_Address}</p>}
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
              {isLoading ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
