import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

interface ColumnOption {
  key: string
  label: string
  defaultVisible: boolean
}

interface ColumnSelectorModalProps {
  isOpen: boolean
  columns: ColumnOption[]
  visibleColumns: Set<string>
  onClose: () => void
  onSave: (visibleColumns: Set<string>) => void
}

export const ColumnSelectorModal = ({
  isOpen,
  columns,
  visibleColumns,
  onClose,
  onSave,
}: ColumnSelectorModalProps) => {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(visibleColumns)

  useEffect(() => {
    setSelectedColumns(new Set(visibleColumns))
  }, [visibleColumns, isOpen])

  const handleToggleColumn = (key: string) => {
    const newSelected = new Set(selectedColumns)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelectedColumns(newSelected)
  }

  const handleSelectAll = () => {
    setSelectedColumns(new Set(columns.map(c => c.key)))
  }

  const handleDeselectAll = () => {
    setSelectedColumns(new Set())
  }

  const handleSave = () => {
    onSave(selectedColumns)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Column Selection</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Select All / Deselect All */}
          <div className="flex gap-2 pb-4 border-b border-gray-200">
            <button
              onClick={handleSelectAll}
              className="flex-1 px-3 py-2 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Deselect All
            </button>
          </div>

          {/* Column List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {columns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No optional columns available</p>
            ) : (
              columns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.has(column.key)}
                    onChange={() => handleToggleColumn(column.key)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{column.label}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
