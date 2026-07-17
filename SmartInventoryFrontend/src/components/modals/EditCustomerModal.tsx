import { useState, useCallback, useEffect, useMemo } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Input } from '@/components'
import { Customer, UpdateCustomerRequest } from '@/types/customer'

interface EditCustomerModalProps {
  isOpen: boolean
  customer: Customer | null
  onClose: () => void
  onUpdate: (data: UpdateCustomerRequest) => Promise<void>
  onDelete: () => Promise<void>
  isLoading?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}

export const EditCustomerModal = ({ isOpen, customer, onClose, onUpdate, onDelete, isLoading = false, canUpdate = true, canDelete = true }: EditCustomerModalProps) => {
  const [formData, setFormData] = useState<UpdateCustomerRequest>({
    company_Name: '',
    customer_Code: '',
    address: '',
    company_Address: '',
    email: '',
    mobile: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize form when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        company_Name: customer.company_Name || '',
        customer_Code: customer.customer_Code || '',
        address: customer.address || '',
        company_Address: customer.company_Address || '',
        email: customer.email || '',
        mobile: customer.mobile || '',
      })
      setErrors({})
    }
  }, [customer])

  // Calculate changed fields (only send fields that differ from original)
  const changedFields = useMemo(() => {
    if (!customer) return {}

    const changes: Partial<UpdateCustomerRequest> = {}

    const fieldMap: Record<string, keyof Customer> = {
      company_Name: 'company_Name',
      customer_Code: 'customer_Code',
      address: 'address',
      company_Address: 'company_Address',
      email: 'email',
      mobile: 'mobile',
    }

    Object.entries(fieldMap).forEach(([formKey, customerKey]) => {
      if (formData[formKey as keyof UpdateCustomerRequest] !== customer[customerKey]) {
        changes[formKey as keyof UpdateCustomerRequest] = formData[formKey as keyof UpdateCustomerRequest]
      }
    })

    return changes
  }, [customer, formData])

  const hasChanges = Object.keys(changedFields).length > 0

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.company_Name?.trim()) newErrors.company_Name = 'Company name is required'
    if (!formData.customer_Code?.trim()) newErrors.customer_Code = 'Customer code is required'
    if (!formData.address?.trim()) newErrors.address = 'Address is required'
    if (!formData.company_Address?.trim()) newErrors.company_Address = 'Company address is required'
    if (!formData.email?.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.mobile?.trim()) newErrors.mobile = 'Mobile number is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !hasChanges) return

    try {
      await onUpdate(formData as UpdateCustomerRequest)
      onClose()
    } catch (error) {
      console.error('Failed to update customer:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete()
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  }

  const handleInputChange = (field: keyof UpdateCustomerRequest, value: any) => {
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

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Customer</h2>
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
          {/* Row 1: Customer Code and Company Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.customer_Code || ''}
                onChange={(e) => handleInputChange('customer_Code', e.target.value)}
                placeholder="e.g., CUST-001"
                error={errors.customer_Code}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.company_Name || ''}
                onChange={(e) => handleInputChange('company_Name', e.target.value)}
                placeholder="e.g., XYZ Retail Ltd."
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
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="e.g., contact@customer.com"
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
                value={formData.mobile || ''}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="e.g., +1-234-567-8900"
                error={errors.mobile}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 3: Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter the customer address..."
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 transition-colors ${
                errors.address
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-transparent'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              disabled={isLoading}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* Row 4: Company Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.company_Address || ''}
              onChange={(e) => handleInputChange('company_Address', e.target.value)}
              placeholder="Enter the company address..."
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 transition-colors ${
                errors.company_Address
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-transparent'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              disabled={isLoading}
            />
            {errors.company_Address && <p className="text-red-500 text-sm mt-1">{errors.company_Address}</p>}
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">Are you sure you want to delete this customer?</p>
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
              disabled={isLoading || showDeleteConfirm || !canDelete}
              title={!canDelete ? 'You do not have permission to delete customers' : ''}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              disabled={isLoading || !hasChanges || !canUpdate}
              title={!canUpdate ? 'You do not have permission to update customers' : ''}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
