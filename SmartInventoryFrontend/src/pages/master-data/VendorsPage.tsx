import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '@/store/slices/vendorSlice'
import { DataGrid, Card, Column, Input } from '@/components'
import { AddVendorModal } from '@/components/modals/AddVendorModal'
import { EditVendorModal } from '@/components/modals/EditVendorModal'
import { Vendor, CreateVendorRequest, UpdateVendorRequest } from '@/types/vendor'
import { Plus, Search, X } from 'lucide-react'

const PAGE_SIZE = 10

export const VendorsPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const { vendors, loading, total } = useAppSelector((state) => state.vendors)

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      const skip = 0
      dispatch(fetchVendors({ skip, take: PAGE_SIZE }) as any)
    }, 500) // 500ms delay

    return () => clearTimeout(debounceTimer)
  }, [searchInput, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchVendors({ skip, take: PAGE_SIZE }) as any)
  }, [currentPage, dispatch])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
  }, [])

  const handleAddVendor = useCallback(async (formData: CreateVendorRequest) => {
    try {
      await dispatch(createVendor(formData) as any)
      // Refresh the list
      dispatch(fetchVendors({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to create vendor:', err)
      throw err
    }
  }, [dispatch])

  const handleRowDoubleClick = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsEditVendorOpen(true)
  }, [])

  const handleUpdateVendor = useCallback(async (formData: UpdateVendorRequest) => {
    if (!selectedVendor) return
    try {
      await dispatch(updateVendor({ id: selectedVendor.id, data: formData }) as any)
      // Refresh the list
      dispatch(fetchVendors({ skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE }) as any)
    } catch (err) {
      console.error('Failed to update vendor:', err)
      throw err
    }
  }, [dispatch, selectedVendor, currentPage])

  const handleDeleteVendor = useCallback(async () => {
    if (!selectedVendor) return
    try {
      await dispatch(deleteVendor(selectedVendor.id) as any)
      // Refresh the list
      dispatch(fetchVendors({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to delete vendor:', err)
      throw err
    }
  }, [dispatch, selectedVendor])

  const columns: Column<Vendor>[] = [
    {
      key: 'vendor_Code',
      label: 'Vendor Code',
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
      key: 'company_Address',
      label: 'Address',
      width: '300px',
    },
    {
      key: 'Creation_Date',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors Management</h1>
          <p className="text-gray-600">Manage your vendor information</p>
        </div>
        <button
          onClick={() => setIsAddVendorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Vendor
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vendor code, company name, email..."
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
        <DataGrid<Vendor>
          columns={columns}
          data={vendors}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No vendors found"
        />
      </Card>

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
        onSubmit={handleAddVendor}
        isLoading={loading}
      />

      {/* Edit Vendor Modal */}
      <EditVendorModal
        isOpen={isEditVendorOpen}
        vendor={selectedVendor}
        onClose={() => {
          setIsEditVendorOpen(false)
          setSelectedVendor(null)
        }}
        onUpdate={handleUpdateVendor}
        onDelete={handleDeleteVendor}
        isLoading={loading}
      />
    </div>
  )
}
