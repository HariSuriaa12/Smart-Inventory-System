import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchItems } from '@/store/slices/itemSlice'
import { DataGrid, Card, Column } from '@/components'
import { Item } from '@/types/item'
import { Plus } from 'lucide-react'

const PAGE_SIZE = 10

export const ItemsPage = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState(1)
  const { items, loading, total } = useAppSelector((state) => state.items)

  useEffect(() => {
    const skip = (currentPage - 1) * PAGE_SIZE
    dispatch(fetchItems({ skip, take: PAGE_SIZE }) as any)
  }, [currentPage, dispatch])

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
