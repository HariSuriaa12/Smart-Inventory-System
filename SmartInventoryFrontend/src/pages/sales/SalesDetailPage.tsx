import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSaleById } from '@/store/slices/salesSlice'
import { DataGrid, Card, Column } from '@/components'
import { ArrowLeft, Package } from 'lucide-react'
import { SalesItem, SalesStatus, SalesStatusLabel } from '@/types/sales'

const STATUS_BADGE_CLASSES: Record<SalesStatus, string> = {
  [SalesStatus.Confirmed]: 'bg-blue-100 text-blue-800',
  [SalesStatus.Completed]: 'bg-green-100 text-green-800',
  [SalesStatus.Refunded]: 'bg-yellow-100 text-yellow-800',
  [SalesStatus.Cancelled]: 'bg-red-100 text-red-800',
}

export const SalesDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentSale: sale } = useAppSelector((state) => state.sales)

  useEffect(() => {
    if (id) {
      dispatch(fetchSaleById(Number(id)) as any)
    }
  }, [id, dispatch])

  if (!sale) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/app/sales')}
          className="text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <Card className="p-6 text-center mt-6">
          <p className="text-gray-500">Sales record not found</p>
        </Card>
      </div>
    )
  }

  const itemColumns: Column<SalesItem>[] = [
    {
      key: 'item_Code',
      label: 'Item Code',
      width: '120px',
      render: (value) => value || '-',
    },
    {
      key: 'item_Name',
      label: 'Item Name',
      width: '200px',
      render: (value) => value || '-',
    },
    {
      key: 'item_Category',
      label: 'Item Category',
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'unit_Of_Measure',
      label: 'Unit of Measure',
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'sold_Quantity',
      label: 'Sold Quantity',
      width: '130px',
      align: 'right',
      render: (value) => Number(value).toFixed(2),
    },
    {
      key: 'discount_Percentage',
      label: 'Discount %',
      width: '120px',
      align: 'right',
      render: (value) => `${Number(value).toFixed(2)}%`,
    },
    {
      key: 'sub_Total',
      label: 'Sub Total',
      width: '130px',
      align: 'right',
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
  ]

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/sales')}
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales #{sale.id}</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGE_CLASSES[sale.sales_Status]}`}>
                {SalesStatusLabel[sale.sales_Status]}
              </span>
              <p className="text-gray-600">
                {new Date(sale.sales_Date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Details Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Location</p>
          <p className="text-lg font-semibold text-gray-900">{sale.location_Name || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Sales Number</p>
          <p className="text-lg font-semibold text-gray-900">{sale.sales_Number || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-lg font-semibold text-gray-900">${Number(sale.total_Amount).toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Items Count</p>
          <p className="text-lg font-semibold text-gray-900">{sale.items?.length || 0}</p>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="flex flex-col overflow-hidden p-6" style={{ height: '520px' }}>
        <div className="mb-4 flex items-center gap-2 flex-shrink-0">
          <Package size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DataGrid<SalesItem>
            columns={itemColumns}
            data={sale.items || []}
            loading={false}
            rowKey="id"
            emptyMessage="No items in this sale"
          />
        </div>
      </Card>
    </div>
  )
}
