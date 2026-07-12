import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/store/slices/customerSlice'
import { DataGrid, Card, Column, Input } from '@/components'
import { AddCustomerModal } from '@/components/modals/AddCustomerModal'
import { EditCustomerModal } from '@/components/modals/EditCustomerModal'
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer'
import { Plus, Search, X } from 'lucide-react'

const PAGE_SIZE = 10

export const CustomersPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const { customers, loading, total } = useAppSelector((state) => state.customers)

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      const skip = 0
      dispatch(fetchCustomers({ skip, take: PAGE_SIZE }) as any)
    }, 500) // 500ms delay

    return () => clearTimeout(debounceTimer)
  }, [searchInput, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchCustomers({ skip, take: PAGE_SIZE }) as any)
  }, [currentPage, dispatch])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
  }, [])

  const handleAddCustomer = useCallback(async (formData: CreateCustomerRequest) => {
    try {
      await dispatch(createCustomer(formData) as any)
      // Refresh the list
      dispatch(fetchCustomers({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to create customer:', err)
      throw err
    }
  }, [dispatch])

  const handleRowDoubleClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditCustomerOpen(true)
  }, [])

  const handleUpdateCustomer = useCallback(async (formData: UpdateCustomerRequest) => {
    if (!selectedCustomer) return
    try {
      await dispatch(updateCustomer({ id: selectedCustomer.id, data: formData }) as any)
      // Refresh the list
      dispatch(fetchCustomers({ skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE }) as any)
    } catch (err) {
      console.error('Failed to update customer:', err)
      throw err
    }
  }, [dispatch, selectedCustomer, currentPage])

  const handleDeleteCustomer = useCallback(async () => {
    if (!selectedCustomer) return
    try {
      await dispatch(deleteCustomer(selectedCustomer.id) as any)
      // Refresh the list
      dispatch(fetchCustomers({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to delete customer:', err)
      throw err
    }
  }, [dispatch, selectedCustomer])

  const columns: Column<Customer>[] = [
    {
      key: 'customer_Code',
      label: 'Customer Code',
      width: '150px',
    },
    {
      key: 'company_Name',
      label: 'Company Name',
      width: '200px',
    },
    {
      key: 'email',
      label: 'Email',
      width: '200px',
    },
    {
      key: 'mobile',
      label: 'Mobile',
      width: '150px',
    },
    {
      key: 'address',
      label: 'Address',
      width: '250px',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers Management</h1>
          <p className="text-gray-600">Manage your customer information</p>
        </div>
        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer code, company name, email..."
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
        <DataGrid<Customer>
          columns={columns}
          data={customers}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No customers found"
        />
      </Card>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSubmit={handleAddCustomer}
        isLoading={loading}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        customer={selectedCustomer}
        onClose={() => {
          setIsEditCustomerOpen(false)
          setSelectedCustomer(null)
        }}
        onUpdate={handleUpdateCustomer}
        onDelete={handleDeleteCustomer}
        isLoading={loading}
      />
    </div>
  )
}
