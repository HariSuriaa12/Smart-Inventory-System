import { X, Download } from 'lucide-react'
import { csvExporter } from '@/utils/csvExporter'

interface PreviewDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: Record<string, any>[]
  columns: {
    key: string
    label: string
  }[]
  filename: string
}

export const PreviewDownloadModal = ({
  isOpen,
  onClose,
  title,
  data,
  columns,
  filename,
}: PreviewDownloadModalProps) => {
  if (!isOpen) return null

  const handleDownload = () => {
    const csvData = data.map((row) => {
      const csvRow: Record<string, any> = {}
      columns.forEach((col) => {
        csvRow[col.label] = row[col.key] ?? ''
      })
      return csvRow
    })

    csvExporter.export(csvData, {
      filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
      headers: columns.map((c) => c.label),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {data.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <p>No data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50">
                      {columns.map((col) => (
                        <td
                          key={`${rowIdx}-${col.key}`}
                          className="px-4 py-3 text-sm text-gray-900"
                        >
                          {typeof row[col.key] === 'boolean'
                            ? row[col.key]
                              ? 'Yes'
                              : 'No'
                            : typeof row[col.key] === 'number'
                              ? row[col.key].toFixed(row[col.key] % 1 === 0 ? 0 : 2)
                              : row[col.key] ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Total Records: <span className="font-semibold">{data.length}</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2"
            >
              <Download size={18} />
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
