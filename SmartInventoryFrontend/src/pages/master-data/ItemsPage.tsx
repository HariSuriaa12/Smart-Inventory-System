import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchItems } from '@/store/slices/itemSlice'
import { DataGrid, Card, Column, Input } from '@/components'
import { Item } from '@/types/item'
import { Plus, Search, X } from 'lucide-react'

const PAGE_SIZE = 10

export const ItemsPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const { items, loading, total, searchQuery } = useAppSelector((state) => state.items)

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchItems({ skip, take: PAGE_SIZE, searchQuery: searchQuery || undefined }) as any)
  }, [currentPage, dispatch, searchQuery])

  const handleSearch = useCallback((query: string) => {
    setSearchInput(query)
    setCurrentPage(1)
    if (query.trim()) {
      dispatch(fetchItems({ skip: 0, take: PAGE_SIZE, searchQuery: query.trim() }) as any)
    } else {
      dispatch(fetchItems({ skip: 0, take: PAGE_SIZE }) as any)
    }
  }, [dispatch])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setCurrentPage(1)
    dispatch(fetchItems({ skip: 0, take: PAGE_SIZE }) as any)
  }, [dispatch])

  const columns: Column<Item>[] = [
    {
      key: 'Item_Code',
      label: 'Item Code',
      width: '120px',
    },
    {
      key: 'Item_Name',
      label: 'Item Name',
      width: '200px',
    },
    {
      key: 'Item_Category',
      label: 'Category',
      width: '150px',
    },
    {
      key: 'Item_Brand',
      label: 'Brand',
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'Unit_Of_Measure',
      label: 'UOM',
      width: '100px',
    },
    {
      key: 'Purchase_Cost',
      label: 'Purchase Cost',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'Unit_Cost',
      label: 'Unit Cost',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'Is_Active',
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
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
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
            onChange={(e) => handleSearch(e.target.value)}
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
          rowKey="id"
          emptyMessage="No items found"
        />
      </Card>
    </div>
  )
}
