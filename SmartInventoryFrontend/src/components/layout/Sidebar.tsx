import { useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Users,
  Building2,
  Truck,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import cn from 'classnames'
import { useState } from 'react'
import { useAuth } from '@/hooks'

interface NavItem {
  title: string
  href?: string
  icon: React.ReactNode
  badge?: number
  submenu?: NavItem[]
}

interface SidebarProps {
  open: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ open, collapsed = false, onToggleCollapse }) => {
  const location = useLocation()
  const { user } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['master-data'])
  console.log('user: ', user)
  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((m) => m !== title) : [...prev, title]
    )
  }

  const masterDataSubmenu = [
    { title: 'Items', href: '/app/master-data/items', icon: <Package size={16} /> },
    { title: 'Locations', href: '/app/master-data/locations', icon: <MapPin size={16} /> },
    { title: 'Vendors', href: '/app/master-data/vendors', icon: <Building2 size={16} /> },
    { title: 'Customers', href: '/app/master-data/customers', icon: <Users size={16} /> },
    { title: 'Users', href: '/app/master-data/users', icon: <Users size={16} /> },
    ...(user?.role === 0 ? [{ title: 'Role Permissions', href: '/app/master-data/role-permissions', icon: <Shield size={16} /> }] : []),
  ]

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/app/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: 'Master Data',
      icon: <Package size={20} />,
      submenu: masterDataSubmenu as NavItem[],
    },
    {
      title: 'Inventory',
      href: '/app/inventory',
      icon: <Package size={20} />,
    },
    {
      title: 'Operations',
      icon: <Truck size={20} />,
      submenu: [
        {
          title: 'Purchase Orders',
          href: '/app/purchase-orders',
          icon: <ShoppingCart size={16} />,
        },
        {
          title: 'Order Fulfillment',
          href: '/app/order-fulfillment',
          icon: <Truck size={16} />,
        },
        {
          title: 'Stock Transfer',
          href: '/app/stock-transfer',
          icon: <TrendingUp size={16} />,
        },
        { title: 'Sales', href: '/app/sales', icon: <BarChart3 size={16} /> },
      ],
    },
    // {
    //   title: 'Analytics',
    //   icon: <BarChart3 size={20} />,
    //   submenu: [
    //     {
    //       title: 'Forecasting',
    //       href: '/app/forecasting',
    //       icon: <TrendingUp size={16} />,
    //     },
    //     { title: 'Reports', href: '/app/reports', icon: <BarChart3 size={16} /> },
    //   ],
    // },
    // {
    //   title: 'Settings',
    //   href: '/app/settings',
    //   icon: <Settings size={20} />,
    // },
  ]

  const isActive = (href?: string) => {
    if (!href) return false
    return location.pathname === href
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isExpanded = expandedMenus.includes(item.title)

    if (hasSubmenu) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleMenu(item.title)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm font-medium',
              'text-gray-700 hover:bg-gray-100',
              level > 0 && 'ml-4',
              collapsed && 'px-5 justify-center'
            )}
            title={collapsed ? item.title : undefined}
          >
            <div className={cn('flex items-center gap-3', collapsed && 'gap-0')}>
              <span className="text-gray-600">{item.icon}</span>
              {!collapsed && <span>{item.title}</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                size={16}
                className={cn('transition-transform', isExpanded && 'rotate-180')}
              />
            )}
          </button>
          {isExpanded && !collapsed && (
            <div className="ml-4 space-y-1">
              {item.submenu!.map((subitem) => renderNavItem(subitem, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        to={item.href || '#'}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium',
          'no-underline',
          isActive(item.href)
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-700 hover:bg-gray-100',
          level > 0 && 'ml-4',
          collapsed && 'px-2 justify-center'
        )}
        title={collapsed ? item.title : undefined}
      >
        <span className={isActive(item.href) ? 'text-primary-600' : 'text-gray-600'}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'fixed lg:sticky top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 lg:translate-x-0',
        collapsed ? 'w-20' : 'w-64',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Sidebar Header */}
      <div className="sticky top-3 px-4 py-4 bg-white flex items-center justify-between">
        {!collapsed && <h2 className="text-lg font-bold text-gray-900">Menu</h2>}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hidden lg:flex"
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className={cn('py-6 space-y-1', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">Version 1.0.0</span>
              <br />
              Smart Inventory System
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
