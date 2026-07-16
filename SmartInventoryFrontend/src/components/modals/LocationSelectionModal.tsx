import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAllLocations, setCurrentLocation } from '@/store/slices/locationSlice'
import { useLocationModal } from '@/context/LocationModalContext'
import { useEffect, useState } from 'react'
import { Building2, CheckCircle, X, ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components'
import { Location } from '@/types/location'
import { useNavigate } from 'react-router-dom'

export const LocationSelectionModal = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLocationModalOpen, isMandatory, openLocationModal, closeLocationModal, onLocationConfirmed, setOnLocationConfirmed } = useLocationModal()
  const { locations, currentLocation, loading, error } = useAppSelector((state) => state.locations)
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)

  useEffect(() => {
    if (isLocationModalOpen && locations.length === 0) {
      dispatch(fetchAllLocations())
    }
  }, [isLocationModalOpen, locations.length, dispatch])

  const handleSelectLocation = (location: Location) => {
    // First, set it as optional if it was mandatory (so closeLocationModal will work)
    if (isMandatory) {
      openLocationModal(false)
    }

    // Update the location
    dispatch(setCurrentLocation(location))

    // Execute callback if set (e.g., from LocationSwitchWarningDialog)
    if (onLocationConfirmed) {
      onLocationConfirmed(location)
      setOnLocationConfirmed(null as any)
    }

    // Close the modal after state updates
    setTimeout(() => {
      closeLocationModal()
    }, 50)
  }

  const handleBackToLogin = () => {
    // Clear current location and navigate to login
    dispatch(setCurrentLocation(null as any))
    navigate('/login')
  }

  if (!isLocationModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => {
        // Only close if clicking on backdrop and not mandatory
        if (e.target === e.currentTarget && !isMandatory) {
          closeLocationModal()
        }
      }}
    >
      {/* Modal Card */}
      <div className={`bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-y-auto h-[45rem] animate-in fade-in zoom-in duration-300 ${
        isMandatory ? 'pointer-events-auto' : ''
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 px-8 py-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Choose Your Outlet</h1>
                {isMandatory && (
                  <p className="text-xs font-semibold text-primary-200 mt-1">Required to continue</p>
                )}
              </div>
            </div>
            <p className="text-primary-100 text-base ml-14">
              {isMandatory ? 'Please select a location to proceed' : 'Select a location to start managing your inventory'}
            </p>
          </div>
          {!isMandatory && (
            <button
              onClick={closeLocationModal}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={24} className="text-white" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner size="lg" className="mb-4" />
              <p className="text-gray-600 text-sm font-medium">Loading your outlets...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <p className="text-red-700 font-semibold mb-1">Unable to load outlets</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={handleBackToLogin}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Login
              </button>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">No outlets available</p>
              <p className="text-gray-500 text-sm mt-2 mb-6">Please contact your administrator</p>
              <button
                onClick={handleBackToLogin}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Login
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <button
                  key={loc.outlet_Code}
                  onClick={() => handleSelectLocation(loc)}
                  className="relative text-left p-5 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {currentLocation?.outlet_Code === loc.outlet_Code ? (
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-primary-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors text-base">
                        {loc.location_Name}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 group-hover:text-primary-600 mt-0.5">
                        {loc.outlet_Code}
                      </p>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 mt-2 leading-relaxed">
                        {loc.address}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
