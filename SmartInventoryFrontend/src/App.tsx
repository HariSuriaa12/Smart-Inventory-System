import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ItemsPage } from '@/pages/master-data/ItemsPage'
import { LocationsPage } from '@/pages/master-data/LocationsPage'
import { VendorsPage } from '@/pages/master-data/VendorsPage'
import { CustomersPage } from '@/pages/master-data/CustomersPage'
import { UsersPage } from '@/pages/master-data/UsersPage'
import { InventoryPage } from '@/pages/inventory/InventoryPage'
import { PurchaseOrderListPage, PurchaseOrderDetailPage } from '@/pages/purchase-order'
import { OrderFulfillmentListPage, OrderFulfillmentDetailPage } from '@/pages/order-fulfillment'
import { SalesListPage, SalesDetailPage } from '@/pages/sales'
import { Card, Badge } from '@/components'
import { LocationModalProvider } from '@/context/LocationModalContext'

function App() {
  const { isAuthenticated } = useAuth()

  const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="p-6">
      <Card>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">This page is coming soon...</p>
          <Badge variant="info">To be implemented</Badge>
        </div>
      </Card>
    </div>
  )

  return (
    <LocationModalProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
        {/* Auth Routes - Without Layout */}
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* Protected Routes - With Layout */}
            <Route element={<MainLayout />}>
              <Route path="/app/dashboard" element={<DashboardPage />} />

              {/* Master Data Routes */}
              <Route path="/app/master-data/items" element={<ItemsPage />} />
              <Route path="/app/master-data/locations" element={<LocationsPage />} />
              <Route path="/app/master-data/vendors" element={<VendorsPage />} />
              <Route path="/app/master-data/customers" element={<CustomersPage />} />
              <Route path="/app/master-data/users" element={<UsersPage />} />

              {/* Transactional Routes */}
              <Route path="/app/inventory" element={<InventoryPage />} />
              <Route path="/app/purchase-orders" element={<PurchaseOrderListPage />} />
              <Route path="/app/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
              <Route path="/app/order-fulfillment" element={<OrderFulfillmentListPage />} />
              <Route path="/app/order-fulfillment/:id" element={<OrderFulfillmentDetailPage />} />
              <Route path="/app/sales" element={<SalesListPage />} />
              <Route path="/app/sales/:id" element={<SalesDetailPage />} />
              <Route path="/app/stock-transfer" element={<PlaceholderPage title="Stock Transfer" />} />
              <Route path="/app/forecasting" element={<PlaceholderPage title="Forecasting & Analytics" />} />
              <Route path="/app/reports" element={<PlaceholderPage title="Reports" />} />
              <Route path="/app/settings" element={<PlaceholderPage title="Settings" />} />
            </Route>

            {/* Default route for authenticated users */}
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </>
        )}
      </Routes>
      </div>
    </LocationModalProvider>
  )
}

export default App
