import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { useLocationModal } from '@/context/LocationModalContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { LocationSelectionModal } from '../modals/LocationSelectionModal'
import { LocationSwitchWarningDialog } from '../modals/LocationSwitchWarningDialog'

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { currentLocation } = useAppSelector((state) => state.locations)
  const { openLocationModal } = useLocationModal()

  // Open location modal if no location is selected (mandatory on first load)
  useEffect(() => {
    if (!currentLocation) {
      openLocationModal(true)
    }
  }, [currentLocation, openLocationModal])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area - Flex Column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Location Selection Modal */}
      <LocationSelectionModal />

      {/* Location Switch Warning Dialog */}
      <LocationSwitchWarningDialog />
    </div>
  )
}
