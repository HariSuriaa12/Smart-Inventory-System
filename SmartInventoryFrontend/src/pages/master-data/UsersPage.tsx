import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUsers, createUser, updateUser, deleteUser } from '@/store/slices/userSlice'
import { DataGrid, Card, Column, Input } from '@/components'
import { AddUserModal } from '@/components/modals/AddUserModal'
import { EditUserModal } from '@/components/modals/EditUserModal'
import { User, CreateUserRequest, UpdateUserRequest, UserRoleLabel } from '@/types/auth'
import { Plus, Search, X } from 'lucide-react'

const PAGE_SIZE = 10

export const UsersPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { users, loading, total } = useAppSelector((state) => state.users)

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      const skip = 0
      dispatch(fetchUsers({ skip, take: PAGE_SIZE }) as any)
    }, 500) // 500ms delay

    return () => clearTimeout(debounceTimer)
  }, [searchInput, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchUsers({ skip, take: PAGE_SIZE }) as any)
  }, [currentPage, dispatch])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
  }, [])

  const handleAddUser = useCallback(async (formData: CreateUserRequest) => {
    try {
      await dispatch(createUser(formData) as any)
      // Refresh the list
      dispatch(fetchUsers({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to create user:', err)
      throw err
    }
  }, [dispatch])

  const handleRowDoubleClick = useCallback((user: User) => {
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }, [])

  const handleUpdateUser = useCallback(async (formData: UpdateUserRequest) => {
    if (!selectedUser) return
    try {
      await dispatch(updateUser({ id: selectedUser.id, data: formData }) as any)
      // Refresh the list
      dispatch(fetchUsers({ skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE }) as any)
    } catch (err) {
      console.error('Failed to update user:', err)
      throw err
    }
  }, [dispatch, selectedUser, currentPage])

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return
    try {
      await dispatch(deleteUser(selectedUser.id) as any)
      // Refresh the list
      dispatch(fetchUsers({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to delete user:', err)
      throw err
    }
  }, [dispatch, selectedUser])

  const columns: Column<User>[] = [
    {
      key: 'username',
      label: 'Username',
      width: '150px',
    },
    {
      key: 'full_Name',
      label: 'Full Name',
      width: '200px',
    },
    {
      key: 'email',
      label: 'Email',
      width: '200px',
    },
    {
      key: 'role',
      label: 'Role',
      width: '120px',
      render: (value) => UserRoleLabel[value] || value,
    },
    {
      key: 'staff_Code',
      label: 'Staff Code',
      width: '120px',
      render: (value) => value || '-',
    },
    {
      key: 'mobile_No',
      label: 'Mobile No',
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'creation_Date',
      label: 'Creation Date',
      width: '150px',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-',
    },
  ]

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
          <p className="text-gray-600">Manage your system users</p>
        </div>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username, full name, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Data Grid Card */}
      <Card className="flex-1 flex flex-col overflow-hidden p-6">
        <DataGrid<User>
          columns={columns}
          data={users}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No users found"
        />
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleAddUser}
        isLoading={loading}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditUserOpen(false)
          setSelectedUser(null)
        }}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
        isLoading={loading}
      />
    </div>
  )
}
