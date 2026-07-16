import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Location } from '@/types/location'

interface LocationModalContextType {
  isLocationModalOpen: boolean
  isWarningDialogOpen: boolean
  isMandatory: boolean
  pendingLocation: Location | null
  openLocationModal: (mandatory?: boolean) => void
  closeLocationModal: () => void
  openWarningDialog: (location: Location) => void
  closeWarningDialog: () => void
  confirmLocationChange: () => void
  cancelLocationChange: () => void
  onLocationConfirmed: ((location: Location) => void) | null
  setOnLocationConfirmed: (callback: (location: Location) => void) => void
}

const LocationModalContext = createContext<LocationModalContextType | undefined>(undefined)

export const LocationModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isMandatory, setIsMandatory] = useState(false)
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false)
  const [pendingLocation, setPendingLocation] = useState<Location | null>(null)
  const [onLocationConfirmed, setOnLocationConfirmed] = useState<((location: Location) => void) | null>(null)

  const openLocationModal = useCallback((mandatory = false) => {
    setIsLocationModalOpen(true)
    setIsMandatory(mandatory)
  }, [])
  const closeLocationModal = useCallback(() => {
    if (!isMandatory) {
      setIsLocationModalOpen(false)
    }
  }, [isMandatory])

  const openWarningDialog = useCallback((location: Location) => {
    setPendingLocation(location)
    setIsWarningDialogOpen(true)
  }, [])

  const closeWarningDialog = useCallback(() => {
    setIsWarningDialogOpen(false)
    setPendingLocation(null)
  }, [])

  const confirmLocationChange = useCallback(() => {
    closeWarningDialog()
    setIsLocationModalOpen(true)
  }, [closeWarningDialog])

  const cancelLocationChange = useCallback(() => {
    closeWarningDialog()
  }, [closeWarningDialog])

  return (
    <LocationModalContext.Provider
      value={{
        isLocationModalOpen,
        isMandatory,
        isWarningDialogOpen,
        pendingLocation,
        openLocationModal,
        closeLocationModal,
        openWarningDialog,
        closeWarningDialog,
        confirmLocationChange,
        cancelLocationChange,
        onLocationConfirmed,
        setOnLocationConfirmed,
      }}
    >
      {children}
    </LocationModalContext.Provider>
  )
}

export const useLocationModal = () => {
  const context = useContext(LocationModalContext)
  if (!context) {
    throw new Error('useLocationModal must be used within LocationModalProvider')
  }
  return context
}
