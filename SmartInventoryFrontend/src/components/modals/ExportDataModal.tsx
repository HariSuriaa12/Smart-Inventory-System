import { useState } from 'react'
import { X, Download, Calendar, Loader } from 'lucide-react'
import { reportService } from '@/services/reportService'
import { toast } from 'react-toastify'

interface ExportDataModalProps {
  isOpen: boolean
  onClose: () => void
}

const AVAILABLE_MODULES = [
  'Purchase Order',
  'Order Fulfilment',
  'Stock Transfer',
  'Sales',
  'Inventory Balance',
]

export const ExportDataModal = ({ isOpen, onClose }: ExportDataModalProps) => {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    if (!selectedModule) {
      toast.error('Please select a module to export')
      return
    }

    try {
      setLoading(true)

      const request = {
        modules: [selectedModule],
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }

      await reportService.exportData(request)
      toast.success('Data exported successfully!')

      setSelectedModule('')
      setStartDate('')
      setEndDate('')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isDateRangeValid = !startDate || !endDate || new Date(startDate) <= new Date(endDate)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Download Reports</h2>
          <button
            onClick={onClose}
            //disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Module Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Module
            </label>
            <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {AVAILABLE_MODULES.map((module) => (
                <label key={module} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="radio"
                    name="module"
                    value={module}
                    checked={selectedModule === module}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{module}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Date Range (Optional)
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              {!isDateRangeValid && (
                <p className="text-xs text-red-600">
                  Start date must be before end date
                </p>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> Files will be downloaded as .CSV format.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || !isDateRangeValid || !selectedModule}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
