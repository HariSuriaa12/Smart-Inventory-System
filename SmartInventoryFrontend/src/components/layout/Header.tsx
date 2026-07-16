import { useState } from 'react'
import { useAuth } from '@/hooks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, User, Settings, Menu, MapPin } from 'lucide-react'
import cn from 'classnames'
import { useLocationModal } from '@/context/LocationModalContext'
import { Location } from '@/types/location'
import { setCurrentLocation } from '@/store/slices/locationSlice'

interface HeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLocationTooltip, setShowLocationTooltip] = useState(false)
  const { currentLocation } = useAppSelector((state) => state.locations)
  const { openLocationModal, openWarningDialog, setOnLocationConfirmed } = useLocationModal()

  const isDashboard = location.pathname === '/app/dashboard'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const handleLocationSwitch = () => {
    if (isDashboard) {
      openLocationModal()
    } else {
      // Only set the navigation callback, don't open modal yet
      openWarningDialog(currentLocation!)
    }
  }

  // Sample notifications
  const notifications = [
    { id: 1, title: 'New Order', message: 'Order #001 received from John', time: '5 min ago', read: false },
    { id: 2, title: 'Low Stock', message: 'Item SKU-123 is running low', time: '15 min ago', read: false },
    { id: 3, title: 'Forecast Ready', message: 'Weekly demand forecast is ready', time: '1 hour ago', read: true },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left Side - Logo & Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">Smart Inventory</span>
          </div>
        </div>

        {/* Right Side - Location, Notifications & User Menu */}
        <div className="flex items-center gap-6">
          {/* Current Location */}
          {currentLocation && (
            <div className="relative">
              <button
                onClick={handleLocationSwitch}
                onMouseEnter={() => setShowLocationTooltip(true)}
                onMouseLeave={() => setShowLocationTooltip(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <MapPin size={18} className="text-primary-600 group-hover:text-primary-700 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900 inline max-w-[150px] truncate">
                  {currentLocation.location_Name}
                </span>
              </button>

              {/* Location Tooltip */}
              {showLocationTooltip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none z-50">
                  Click here to switch outlet
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={24} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {/* {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                        !notification.read && 'bg-blue-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                            !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                          )}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                          <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                          <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-gray-50 text-center border-t border-gray-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )} */}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="font-medium text-gray-900 hidden sm:inline text-sm">{user?.fullName || 'User'}</span>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900 text-sm">{user?.fullName}</p>
                  <p className="text-gray-600 text-xs">{user?.email}</p>
                </div>
                <nav className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                    <User size={16} />
                    My Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                    <Settings size={16} />
                    Settings
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
