import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchItems, createItem, updateItem, deleteItem } from '@/store/slices/itemSlice'
import { DataGrid, Card, Column, Input } from '@/components'
import { AddItemModal } from '@/components/modals/AddItemModal'
import { EditItemModal } from '@/components/modals/EditItemModal'
import { Item, CreateItemRequest, UpdateItemRequest } from '@/types/item'
import { Plus, Search, X, AlertCircle } from 'lucide-react'
import { useAuth, useRolePermissions } from '@/hooks'

const PAGE_SIZE = 10

export const ItemsPage = () => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { permissions } = useRolePermissions(user?.role)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const { items, loading, total, searchQuery, error } = useAppSelector((state) => state.items)

  // Check if user has permission to edit/delete
  const canEdit = permissions?.update_Data ?? false
  const canDelete = permissions?.delete_Data ?? false
  const canCreate = permissions?.create_Data ?? false

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      if (searchInput.trim()) {
        dispatch(fetchItems({ skip: 0, take: PAGE_SIZE, searchQuery: searchInput.trim() }) as any)
      } else {
        dispatch(fetchItems({ skip: 0, take: PAGE_SIZE }) as any)
      }
    }, 500) // 500ms delay

    return () => clearTimeout(debounceTimer)
  }, [searchInput, dispatch])

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchItems({ skip, take: PAGE_SIZE, searchQuery: searchQuery || undefined }) as any)
  }, [currentPage, dispatch, searchQuery])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
  }, [])

  const handleAddItem = useCallback(async (formData: CreateItemRequest) => {
    try {
      await dispatch(createItem(formData) as any)
      // Refresh the list
      dispatch(fetchItems({ skip: 0, take: PAGE_SIZE, searchQuery: searchQuery || undefined }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to create item:', err)
      throw err
    }
  }, [dispatch, searchQuery])

  const handleRowDoubleClick = useCallback((item: Item) => {
    if (!canEdit && !canDelete) {
      return // Don't allow editing if user doesn't have edit or delete permission
    }
    setSelectedItem(item)
    setIsEditItemOpen(true)
  }, [canEdit, canDelete])

  const handleUpdateItem = useCallback(async (formData: UpdateItemRequest) => {
    if (!selectedItem) return
    try {
      await dispatch(updateItem({ id: selectedItem.id, data: formData }) as any)
      // Refresh the list
      dispatch(fetchItems({ skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE, searchQuery: searchQuery || undefined }) as any)
    } catch (err) {
      console.error('Failed to update item:', err)
      throw err
    }
  }, [dispatch, selectedItem, currentPage, searchQuery])

  const handleDeleteItem = useCallback(async () => {
    if (!selectedItem) return
    try {
      await dispatch(deleteItem(selectedItem.id) as any)
      // Refresh the list
      dispatch(fetchItems({ skip: 0, take: PAGE_SIZE, searchQuery: searchQuery || undefined }) as any)
      setCurrentPage(1)
    } catch (err) {
      console.error('Failed to delete item:', err)
      throw err
    }
  }, [dispatch, selectedItem, searchQuery])

  const columns: Column<Item>[] = [
    {
      key: 'item_Code',
      label: 'Item Code',
      width: '120px',
    },
    {
      key: 'item_Name',
      label: 'Item Name',
      width: '200px',
    },
    {
      key: 'description',
      label: 'Description',
      width: '200px',
    },
    {
      key: 'item_Category',
      label: 'Category',
      width: '150px',
    },
    {
      key: 'item_Brand',
      label: 'Brand',
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'unit_Of_Measure',
      label: 'UOM',
      width: '100px',
    },
    {
      key: 'purchase_Cost',
      label: 'Purchase Cost',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'unit_Cost',
      label: 'Unit Cost',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'tax_Percentage',
      label: 'Tax %',
      width: '100px',
      align: 'right',
      render: (value) => `${Number(value).toFixed(2)}%`,
    },
    {
      key: 'tax_Type',
      label: 'Tax Type',
      width: '100px',
    },
    {
      key: 'is_Active',
      label: 'Status',
      width: '100px',
      render: (value) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Items Management</h1>
          <p className="text-gray-600">Manage your inventory items</p>
        </div>
        <button
          onClick={() => setIsAddItemOpen(true)}
          disabled={!canCreate}
          title={!canCreate ? 'You do not have permission to create items' : ''}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item code, name, brand..."
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
        <DataGrid<Item>
          columns={columns}
          data={items}
          loading={loading}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          onRowDoubleClick={handleRowDoubleClick}
          rowKey="id"
          emptyMessage="No items found"
        />
      </Card>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onSubmit={handleAddItem}
        isLoading={loading}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditItemOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditItemOpen(false)
          setSelectedItem(null)
        }}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        isLoading={loading}
        canUpdate={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}
