import { useState, useCallback, useEffect, useMemo } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Input } from '@/components'
import { User, UpdateUserRequest, UserRole, UserRoleLabel } from '@/types/auth'

interface EditUserModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onUpdate: (data: UpdateUserRequest) => Promise<void>
  onDelete: () => Promise<void>
  isLoading?: boolean
}

export const EditUserModal = ({ isOpen, user, onClose, onUpdate, onDelete, isLoading = false }: EditUserModalProps) => {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    full_Name: '',
    email: '',
    role: UserRole.Staff,
    mobile_No: '',
    staff_Code: '',
    ic: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_Name: user.full_Name || '',
        email: user.email || '',
        role: user.role || UserRole.Staff,
        mobile_No: user.mobile_No || '',
        staff_Code: user.staff_Code || '',
        ic: user.ic || '',
      })
      setErrors({})
    }
  }, [user])

  // Calculate changed fields (only send fields that differ from original)
  const changedFields = useMemo(() => {
    if (!user) return {}

    const changes: Partial<UpdateUserRequest> = {}

    const fieldMap: Record<string, keyof User> = {
      full_Name: 'full_Name',
      email: 'email',
      role: 'role',
      mobile_No: 'mobile_No',
      staff_Code: 'staff_Code',
      ic: 'ic',
    }

    Object.entries(fieldMap).forEach(([formKey, userKey]) => {
      if (formData[formKey as keyof UpdateUserRequest] !== user[userKey]) {
        changes[formKey as keyof UpdateUserRequest] = formData[formKey as keyof UpdateUserRequest]
      }
    })

    return changes
  }, [user, formData])

  const hasChanges = Object.keys(changedFields).length > 0

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_Name?.trim()) newErrors.full_Name = 'Full name is required'
    if (!formData.email?.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !hasChanges) return

    try {
      await onUpdate(formData as UpdateUserRequest)
      onClose()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete()
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleInputChange = (field: keyof UpdateUserRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
    console.log('Changed field:', field, 'New value:', value)
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
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
          {/* Row 1: Full Name and Username (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.full_Name || ''}
                onChange={(e) => handleInputChange('full_Name', e.target.value)}
                placeholder="e.g., John Doe"
                error={errors.full_Name}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <Input
                type="text"
                value={user.username || ''}
                placeholder="e.g., john.doe"
                disabled
              />
              <p className="text-gray-500 text-xs mt-1">Cannot be changed</p>
            </div>
          </div>

          {/* Row 2: Email and Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="e.g., john@example.com"
                error={errors.email}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role || UserRole.Staff}
                onChange={(e) => handleInputChange('role', parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 focus:border-transparent bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={UserRole.Admin}>{UserRoleLabel[UserRole.Admin]}</option>
                <option value={UserRole.Manager}>{UserRoleLabel[UserRole.Manager]}</option>
                <option value={UserRole.Staff}>{UserRoleLabel[UserRole.Staff]}</option>
                <option value={UserRole.IT}>{UserRoleLabel[UserRole.IT]}</option>
                <option value={UserRole.Other}>{UserRoleLabel[UserRole.Other]}</option>
              </select>
            </div>
          </div>

          {/* Row 3: Staff Code and IC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Code</label>
              <Input
                type="text"
                value={formData.staff_Code || ''}
                onChange={(e) => handleInputChange('staff_Code', e.target.value)}
                placeholder="e.g., STF-001"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IC Number</label>
              <Input
                type="text"
                value={formData.ic || ''}
                onChange={(e) => handleInputChange('ic', e.target.value)}
                placeholder="e.g., 123456-07-1234"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Row 4: Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <Input
              type="tel"
              value={formData.mobile_No || ''}
              onChange={(e) => handleInputChange('mobile_No', e.target.value)}
              placeholder="e.g., +1-234-567-8900"
              disabled={isLoading}
            />
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">Are you sure you want to delete this user?</p>
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
