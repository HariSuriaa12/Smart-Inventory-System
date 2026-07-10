import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import cn from 'classnames'

export interface Column<T> {
  key: keyof T
  label: string
  width?: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface DataGridProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  rowKey: keyof T
  className?: string
  emptyMessage?: string
}

export const DataGrid = <T,>({
  columns,
  data,
  loading = false,
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  rowKey,
  className,
  emptyMessage = 'No data available',
}: DataGridProps<T>) => {
  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize])

  const paginationItems = useMemo(() => {
    const items = []
    const maxButtons = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i)
    }

    return items
  }, [currentPage, totalPages])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center'
                  )}
                  style={col.width ? { width: col.width, minWidth: col.width } : {}}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={String(item[rowKey])} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {columns.map((col) => {
                    const value = item[col.key]
                    const rendered = col.render ? col.render(value, item) : value
                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center'
                        )}
                        title={typeof rendered === 'string' ? rendered : undefined}
                      >
                        {rendered}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={cn(
                'p-2 rounded-lg transition-colors',
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>

            {paginationItems.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                'p-2 rounded-lg transition-colors',
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
