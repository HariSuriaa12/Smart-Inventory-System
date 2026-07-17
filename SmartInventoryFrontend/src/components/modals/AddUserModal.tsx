import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components'
import { CreateUserRequest, UserRole, UserRoleLabel } from '@/types/auth'
import { rolePermissionService } from '@/services/rolePermissionService'
import { RolePermission } from '@/types/rolePermission'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateUserRequest) => Promise<void>
  isLoading?: boolean
}

export const AddUserModal = ({ isOpen, onClose, onSubmit, isLoading = false }: AddUserModalProps) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    full_Name: '',
    username: '',
    password: '',
    email: '',
    role: UserRole.Staff,
    mobile_No: '',
    staff_Code: '',
    ic: '',
  })
  const [activeRoles, setActiveRoles] = useState<RolePermission[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          setRolesLoading(true)
          const response = await rolePermissionService.getActiveRoles()
          if (response.success && response.data) {
            setActiveRoles(response.data)
            // Set default role to first available role
            if (response.data.length > 0) {
              setFormData(prev => ({ ...prev, role: response.data[0].role_ID }))
            }
          }
        } catch (error) {
          console.error('Failed to fetch active roles:', error)
        } finally {
          setRolesLoading(false)
        }
      }
      fetchRoles()
    }
  }, [isOpen])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_Name.trim()) newErrors.full_Name = 'Full name is required'
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
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
        full_Name: '',
        username: '',
        password: '',
        email: '',
        role: UserRole.Staff,
        mobile_No: '',
        staff_Code: '',
        ic: '',
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleInputChange = (field: keyof CreateUserRequest, value: any) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
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
          {/* Row 1: Full Name and Username */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.full_Name}
                onChange={(e) => handleInputChange('full_Name', e.target.value)}
                placeholder="e.g., John Doe"
                error={errors.full_Name}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="e.g., john.doe"
                error={errors.username}
                disabled={isLoading}
              />
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
                value={formData.email}
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
                value={formData.role}
                onChange={(e) => handleInputChange('role', parseInt(e.target.value))}
                disabled={isLoading || rolesLoading || activeRoles.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 focus:border-transparent bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {rolesLoading ? (
                  <option>Loading roles...</option>
                ) : activeRoles.length === 0 ? (
                  <option>No roles available</option>
                ) : (
                  activeRoles.map(role => (
                    <option key={role.role_ID} value={role.role_ID}>
                      {role.role_Name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Row 3: Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter a strong password"
              error={errors.password}
              disabled={isLoading}
            />
          </div>

          {/* Row 4: Staff Code and IC */}
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

          {/* Row 5: Mobile Number */}
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
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
