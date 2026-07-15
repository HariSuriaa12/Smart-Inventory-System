import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSaleById } from '@/store/slices/salesSlice'
import { DataGrid, Card, Column, Badge, LoadingSpinner } from '@/components'
import { ArrowLeft } from 'lucide-react'
import { SalesItem, SalesStatus, SalesStatusLabel } from '@/types/sales'

export const SalesDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentSale: sale, loading } = useAppSelector((state) => state.sales)

  useEffect(() => {
    if (id) {
      dispatch(fetchSaleById(Number(id)) as any)
    }
  }, [id, dispatch])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!sale) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Record Not Found</h1>
            <button
              onClick={() => navigate('/app/sales')}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Back to Sales
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const statusBadgeClasses: Record<SalesStatus, string> = {
    [SalesStatus.Pending]: 'bg-blue-100 text-blue-800',
    [SalesStatus.Completed]: 'bg-green-100 text-green-800',
    [SalesStatus.Cancelled]: 'bg-red-100 text-red-800',
  }

  const salesDate = new Date(sale.sales_Date)
  const salesTime = sale.sales_Time || '00:00'
  const [hours, minutes] = salesTime.split(':')
  const formattedTime = `${hours}:${minutes}`

  const columns: Column<SalesItem>[] = [
    {
      key: 'id',
      label: 'Item ID',
      width: '80px',
    },
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
      label: 'Category',
      width: '150px',
      render: (value) => value || '-',
    },
    {
      key: 'unit_Of_Measure',
      label: 'UOM',
      width: '100px',
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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/sales')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Sales"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Details</h1>
          <p className="text-gray-600 mt-1">Sales ID: {sale.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sales Date</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {salesDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sales Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formattedTime}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sales Number</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{sale.sales_Number || '-'}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{sale.location_Name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-1">
                <Badge className={statusBadgeClasses[sale.sales_Status]}>
                  {SalesStatusLabel[sale.sales_Status]}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">${Number(sale.total_Amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Items Count</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{sale.items?.length || 0}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Items</h2>
          <DataGrid
            columns={columns}
            data={sale.items || []}
            loading={false}
          />
        </div>
      </Card>
    </div>
  )
}
