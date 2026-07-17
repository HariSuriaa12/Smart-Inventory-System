import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components'
import { RolePermission, CreateRolePermissionRequest, UpdateRolePermissionRequest } from '@/types/rolePermission'
import { rolePermissionService } from '@/services/rolePermissionService'
import { useAuth } from '@/hooks'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'

const PAGE_SIZE = 10

export const RolePermissionsPage = () => {
  const { user } = useAuth()
  const [roles, setRoles] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RolePermission | null>(null)
  const [formData, setFormData] = useState<CreateRolePermissionRequest>({
    role_ID: 0,
    role_Name: '',
    view_Items: false,
    view_Locations: false,
    view_Vendors: false,
    view_Customers: false,
    view_Users: false,
    view_Inventory: false,
    view_Purchase_Orders: false,
    view_Order_Fulfillment: false,
    view_Stock_Transfer: false,
    view_Sales: false,
    create_Data: false,
    update_Data: false,
    delete_Data: false,
  })
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user?.role !== 1) {
      setError('Only administrators can access role permissions')
      return
    }
    fetchRoles()
  }, [user])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * PAGE_SIZE
      const response = await rolePermissionService.getRolePermissions(skip, PAGE_SIZE)
      if (response.success && response.data) {
        setRoles(response.data.data.filter((r) => r.id !== 1) || []) //Exclude super admin
      }
    } catch (err) {
      setError('Failed to fetch roles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async () => {
    try {
      setError('')
      if (!formData.role_ID || !formData.role_Name) {
        setError('Role ID and Role Name are required')
        return
      }
      await rolePermissionService.createRolePermission(formData)
      setIsAddOpen(false)
      resetForm()
      await fetchRoles()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create role')
    }
  }

  const handleEditRole = async () => {
    try {
      setError('')
      if (!selectedRole) return
      const updateData: UpdateRolePermissionRequest = {
        role_Name: formData.role_Name,
        view_Items: formData.view_Items,
        view_Locations: formData.view_Locations,
        view_Vendors: formData.view_Vendors,
        view_Customers: formData.view_Customers,
        view_Users: formData.view_Users,
        view_Inventory: formData.view_Inventory,
        view_Purchase_Orders: formData.view_Purchase_Orders,
        view_Order_Fulfillment: formData.view_Order_Fulfillment,
        view_Stock_Transfer: formData.view_Stock_Transfer,
        view_Sales: formData.view_Sales,
        create_Data: formData.create_Data,
        update_Data: formData.update_Data,
        delete_Data: formData.delete_Data,
        is_Active: selectedRole.is_Active,
      }
      console.log('Updating role with ID:', selectedRole.id, 'Data:', updateData) // Debugging line
      await rolePermissionService.updateRolePermission(selectedRole.id, updateData)
      setIsEditOpen(false)
      resetForm()
      await fetchRoles()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleDeleteRole = async () => {
    try {
      setDeleteError('')
      if (!selectedRole) return

      const canDelete = await rolePermissionService.canDeleteRole(selectedRole.role_ID)
      if (!canDelete.data) {
        setDeleteError('Cannot delete role because users are assigned to it')
        return
      }

      await rolePermissionService.deleteRolePermission(selectedRole.id)
      setIsEditOpen(false)
      resetForm()
      await fetchRoles()
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete role')
    }
  }

  const handleEditClick = (role: RolePermission) => {
    setSelectedRole(role)
    console.log('Editing role:', role) // Debugging line
    setFormData({
      role_ID: role.role_ID,
      role_Name: role.role_Name,
      view_Items: role.view_Items,
      view_Locations: role.view_Locations,
      view_Vendors: role.view_Vendors,
      view_Customers: role.view_Customers,
      view_Users: role.view_Users,
      view_Inventory: role.view_Inventory,
      view_Purchase_Orders: role.view_Purchase_Orders,
      view_Order_Fulfillment: role.view_Order_Fulfillment,
      view_Stock_Transfer: role.view_Stock_Transfer,
      view_Sales: role.view_Sales,
      create_Data: role.create_Data,
      update_Data: role.update_Data,
      delete_Data: role.delete_Data,
    })
    setIsEditOpen(true)
  }

  const handleAddClick = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const resetForm = () => {
    setFormData({
      role_ID: 0,
      role_Name: '',
      view_Items: false,
      view_Locations: false,
      view_Vendors: false,
      view_Customers: false,
      view_Users: false,
      view_Inventory: false,
      view_Purchase_Orders: false,
      view_Order_Fulfillment: false,
      view_Stock_Transfer: false,
      view_Sales: false,
      create_Data: false,
      update_Data: false,
      delete_Data: false,
    })
    setSelectedRole(null)
    setError('')
    setDeleteError('')
  }

  const togglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key as keyof CreateRolePermissionRequest],
    }))
  }

  if (user?.role !== 1) {
    return (
      <div className="p-6">
        <Card>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Permissions Management</h1>
          <p className="text-gray-600">Manage roles and their permissions</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      {/* Roles Table */}
      <div className="flex-1 overflow-y-auto">
        <Card>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No roles found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">View Permissions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900"></th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{role.role_ID}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{role.role_Name}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-1 flex-wrap max-w-xs">
                          {role.view_Items && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Items</span>}
                          {role.view_Locations && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Locations</span>}
                          {role.view_Vendors && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Vendors</span>}
                          {role.view_Customers && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Customers</span>}
                          {role.view_Inventory && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Inventory</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-1">
                          {role.create_Data && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Create</span>}
                          {role.update_Data && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Update</span>}
                          {role.delete_Data && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Delete</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${role.is_Active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {role.is_Active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(role)}
                            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                            title="Edit role"
                          >
                            <Edit2 size={18} />
                          </button>
                          {/* <button
                            onClick={() => {
                              setSelectedRole(role)
                              setIsEditOpen(true)
                            }}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete role"
                          >
                            <Trash2 size={18} />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{isEditOpen ? 'Edit Role' : 'Add New Role'}</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  {deleteError}
                </div>
              )}

              <div className="space-y-6">
                {/* Role ID and Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role ID</label>
                    <input
                      type="number"
                      disabled={isEditOpen}
                      value={formData.role_ID}
                      onChange={(e) => setFormData(prev => ({ ...prev, role_ID: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                    <input
                      type="text"
                      value={formData.role_Name}
                      onChange={(e) => setFormData(prev => ({ ...prev, role_Name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Manager"
                    />
                  </div>
                </div>

                {/* View Permissions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">View Permissions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'view_Items', label: 'Items' },
                      { key: 'view_Locations', label: 'Locations' },
                      { key: 'view_Vendors', label: 'Vendors' },
                      { key: 'view_Customers', label: 'Customers' },
                      { key: 'view_Users', label: 'Users' },
                      { key: 'view_Inventory', label: 'Inventory' },
                      { key: 'view_Purchase_Orders', label: 'Purchase Orders' },
                      { key: 'view_Order_Fulfillment', label: 'Order Fulfillment' },
                      { key: 'view_Stock_Transfer', label: 'Stock Transfer' },
                      { key: 'view_Sales', label: 'Sales' },
                    ].map(perm => (
                      <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[perm.key as keyof CreateRolePermissionRequest] as boolean}
                          onChange={() => togglePermission(perm.key)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* General Permissions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">General Permissions</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'create_Data', label: 'Create Data' },
                      { key: 'update_Data', label: 'Update Data' },
                      { key: 'delete_Data', label: 'Delete Data' },
                    ].map(perm => (
                      <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[perm.key as keyof CreateRolePermissionRequest] as boolean}
                          onChange={() => togglePermission(perm.key)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  {isEditOpen && (
                    <button
                      onClick={handleDeleteRole}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Role
                    </button>
                  )}
                  <button
                    onClick={() => {
                      resetForm()
                      setIsAddOpen(false)
                      setIsEditOpen(false)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isEditOpen ? handleEditRole : handleAddRole}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {isEditOpen ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
