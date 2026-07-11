import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '@/store/slices/locationSlice'
import { DataGrid, Card, Column, Input } from '@/components'
import { AddLocationModal } from '@/components/modals/AddLocationModal'
import { EditLocationModal } from '@/components/modals/EditLocationModal'
import { Location, CreateLocationRequest, UpdateLocationRequest } from '@/types/location'
import { Plus, Search, X } from 'lucide-react'

const PAGE_SIZE = 10

export const LocationsPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const { locations, loading, total } = useAppSelector((state) => state.locations)

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      const skip = 0
      dispatch(fetchLocations({ skip, take: PAGE_SIZE }) as any)
    }, 500) // 500ms delay

    return () => clearTimeout(debounceTimer)
  }, [searchInput, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchLocations({ skip, take: PAGE_SIZE }) as any)
  }, [currentPage, dispatch])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
  }, [])

  const handleAddLocation = useCallback(async (formData: CreateLocationRequest) => {
    try {
      await dispatch(createLocation(formData) as any)
      // Refresh the list
      dispatch(fetchLocations({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to create location:', err)
      throw err
    }
  }, [dispatch])

  const handleRowDoubleClick = useCallback((location: Location) => {
    setSelectedLocation(location)
    setIsEditLocationOpen(true)
  }, [])

  const handleUpdateLocation = useCallback(async (formData: UpdateLocationRequest) => {
    if (!selectedLocation) return
    try {
      await dispatch(updateLocation({ id: selectedLocation.id, data: formData }) as any)
      // Refresh the list
      dispatch(fetchLocations({ skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE }) as any)
    } catch (err) {
      console.error('Failed to update location:', err)
      throw err
    }
  }, [dispatch, selectedLocation, currentPage])

  const handleDeleteLocation = useCallback(async () => {
    if (!selectedLocation) return
    try {
      await dispatch(deleteLocation(selectedLocation.id) as any)
      // Refresh the list
      dispatch(fetchLocations({ skip: 0, take: PAGE_SIZE }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to delete location:', err)
      throw err
    }
  }, [dispatch, selectedLocation])

  const columns: Column<Location>[] = [
    {
      key: 'Outlet_Code',
      label: 'Outlet Code',
      width: '150px',
    },
    {
      key: 'Location_Name',
      label: 'Location Name',
      width: '200px',
    },
    {
      key: 'Location_Type',
      label: 'Location Type',
      width: '150px',
    },
    {
      key: 'Address',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Locations Management</h1>
          <p className="text-gray-600">Manage your inventory locations</p>
        </div>
        <button
          onClick={() => setIsAddLocationOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Location
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location name, outlet code..."
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
        <DataGrid<Location>
          columns={columns}
          data={locations}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No locations found"
        />
      </Card>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        onSubmit={handleAddLocation}
        isLoading={loading}
      />

      {/* Edit Location Modal */}
      <EditLocationModal
        isOpen={isEditLocationOpen}
        location={selectedLocation}
        onClose={() => {
          setIsEditLocationOpen(false)
          setSelectedLocation(null)
        }}
        onUpdate={handleUpdateLocation}
        onDelete={handleDeleteLocation}
        isLoading={loading}
      />
    </div>
  )
}
