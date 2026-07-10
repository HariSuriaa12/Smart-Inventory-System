import { createContext, useContext, useState, ReactNode } from 'react'

interface LocationModalContextType {
  isLocationModalOpen: boolean
  openLocationModal: () => void
  closeLocationModal: () => void
}

const LocationModalContext = createContext<LocationModalContextType | undefined>(undefined)

export const LocationModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const openLocationModal = () => setIsLocationModalOpen(true)
  const closeLocationModal = () => setIsLocationModalOpen(false)

  return (
    <LocationModalContext.Provider value={{ isLocationModalOpen, openLocationModal, closeLocationModal }}>
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
