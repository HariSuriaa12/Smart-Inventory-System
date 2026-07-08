import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import itemReducer from './slices/itemSlice'
import locationReducer from './slices/locationSlice'
import vendorReducer from './slices/vendorSlice'
import customerReducer from './slices/customerSlice'
import userReducer from './slices/userSlice'
import inventoryReducer from './slices/inventorySlice'
import purchaseOrderReducer from './slices/purchaseOrderSlice'
import orderFulfillmentReducer from './slices/orderFulfillmentSlice'
import salesReducer from './slices/salesSlice'
import stockTransferReducer from './slices/stockTransferSlice'
import forecastingReducer from './slices/forecastingSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemReducer,
    locations: locationReducer,
    vendors: vendorReducer,
    customers: customerReducer,
    users: userReducer,
    inventory: inventoryReducer,
    purchaseOrders: purchaseOrderReducer,
    orderFulfillment: orderFulfillmentReducer,
    sales: salesReducer,
    stockTransfer: stockTransferReducer,
    forecasting: forecastingReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
