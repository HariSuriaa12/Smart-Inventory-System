import { useNavigate } from 'react-router-dom'
import { useLocationModal } from '@/context/LocationModalContext'
import { AlertCircle } from 'lucide-react'

export const LocationSwitchWarningDialog = () => {
  const navigate = useNavigate()
  const { isWarningDialogOpen, closeWarningDialog, confirmLocationChange, cancelLocationChange, setOnLocationConfirmed } =
    useLocationModal()

  const handleConfirm = () => {
    // Set the callback to navigate after location selection
    setOnLocationConfirmed(() => {
      navigate('/app/dashboard', { replace: true })
    })
    // Then open the location selection modal
    confirmLocationChange()
  }

  if (!isWarningDialogOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 animate-in fade-in zoom-in duration-300">
        {/* Content */}
        <div className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-yellow-100 rounded-lg flex-shrink-0">
              <AlertCircle size={24} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Switch Outlet?</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Switching outlets will bring you back to the dashboard page. Any unsaved changes on the current page will be lost.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={cancelLocationChange}
              className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              No, Stay Here
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
            >
              Yes, Switch Outlet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
