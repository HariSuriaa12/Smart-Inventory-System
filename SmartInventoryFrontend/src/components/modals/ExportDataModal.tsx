import { useState, useMemo } from 'react'
import { X, Download, Calendar, Loader, ChevronDown } from 'lucide-react'
import { reportService } from '@/services/reportService'
import { toast } from 'react-toastify'

interface ExportDataModalProps {
  isOpen: boolean
  onClose: () => void
}

type ExportType = 'master' | 'transactional' | 'logging'

const EXPORT_MODULES = {
  master: ['Users', 'Items', 'Locations', 'Vendors', 'Customers'],
  transactional: [
    'Inventory',
    'Purchase Orders',
    'Order Fulfillment',
    'Sales',
    'Stock Transfers',
  ],
  logging: ['Perform Logs', 'Inventory Logs', 'Price Logs'],
}

export const ExportDataModal = ({ isOpen, onClose }: ExportDataModalProps) => {
  const [exportType, setExportType] = useState<ExportType>('master')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [expandedModules, setExpandedModules] = useState(true)

  const availableModules = useMemo(() => {
    return EXPORT_MODULES[exportType]
  }, [exportType])

  if (!isOpen) return null

  const handleExportTypeChange = (type: ExportType) => {
    setExportType(type)
    setSelectedModules([])
  }

  const toggleModule = (module: string) => {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    )
  }

  const selectAllModules = () => {
    setSelectedModules(availableModules)
  }

  const deselectAllModules = () => {
    setSelectedModules([])
  }

  const handleExport = async () => {
    if (selectedModules.length === 0) {
      toast.error('Please select at least one module to export')
      return
    }

    try {
      setLoading(true)

      const request = {
        modules: selectedModules,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }

      switch (exportType) {
        case 'master':
          await reportService.exportMasterData(request)
          toast.success('Master data exported successfully!')
          break
        case 'transactional':
          await reportService.exportTransactionalData(request)
          toast.success('Transactional data exported successfully!')
          break
        case 'logging':
          await reportService.exportLoggingData(request)
          toast.success('Logging data exported successfully!')
          break
      }

      //onClose()
      setSelectedModules([])
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
          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Export Type
            </label>
            {/*<div className="space-y-3">*/}
            <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                onClick={() => toggleModule('master')}>
                <input
                  type="radio"
                  name="exportType"
                  value="master"
                  checked={exportType === 'master'}
                  onChange={(e) => handleExportTypeChange(e.target.value as ExportType)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Purchase Order</p>
                  <p className="text-xs text-gray-500">Export purchase order data</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                onClick={() => handleExportTypeChange('transactional')}>
                <input
                  type="radio"
                  name="exportType"
                  value="transactional"
                  checked={exportType === 'transactional'}
                  onChange={(e) => handleExportTypeChange(e.target.value as ExportType)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Order Fulfilment</p>
                  <p className="text-xs text-gray-500">
                    Export order fulfilment data
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                onClick={() => handleExportTypeChange('logging')}>
                <input
                  type="radio"
                  name="exportType"
                  value="logging"
                  checked={exportType === 'logging'}
                  onChange={(e) => handleExportTypeChange(e.target.value as ExportType)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Stock Transfer</p>
                  <p className="text-xs text-gray-500">
                    Export stock transfer data
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                onClick={() => handleExportTypeChange('logging')}>
                <input
                  type="radio"
                  name="exportType"
                  value="logging"
                  checked={exportType === 'logging'}
                  onChange={(e) => handleExportTypeChange(e.target.value as ExportType)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Sales</p>
                  <p className="text-xs text-gray-500">
                    Export sales data
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                onClick={() => handleExportTypeChange('logging')}>
                <input
                  type="radio"
                  name="exportType"
                  value="logging"
                  checked={exportType === 'logging'}
                  onChange={(e) => handleExportTypeChange(e.target.value as ExportType)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Inventory Balance</p>
                  <p className="text-xs text-gray-500">
                    Export inventory balance data
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Module Selection */}
          {/*<div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-900">
                Select Modules
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selectAllModules}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllModules}
                  disabled={loading}
                  className="text-xs text-gray-600 hover:text-gray-700 disabled:opacity-50 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {availableModules.map((module) => (
                <label key={module} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(module)}
                    onChange={() => toggleModule(module)}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700">{module}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {selectedModules.length} of {availableModules.length} selected
            </p>
          </div>*/}

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
            disabled={loading || !isDateRangeValid || selectedModules.length === 0}
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
