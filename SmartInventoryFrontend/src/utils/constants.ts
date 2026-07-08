export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Smart Inventory System'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const PAGINATION_DEFAULTS = {
  SKIP: 0,
  TAKE: 10,
  TAKE_OPTIONS: [5, 10, 25, 50, 100],
}

export const STATUS_COLORS = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  pending: 'bg-gray-100 text-gray-800',
}

export const STATUS_BADGES = {
  success: 'bg-green-100 text-green-700 border-green-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
}

export const INPUT_VALIDATION = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
}

export const MODULE_ROUTES = {
  AUTH: '/auth',
  DASHBOARD: '/app/dashboard',
  ITEMS: '/app/master-data/items',
  LOCATIONS: '/app/master-data/locations',
  VENDORS: '/app/master-data/vendors',
  CUSTOMERS: '/app/master-data/customers',
  USERS: '/app/master-data/users',
  INVENTORY: '/app/inventory',
  PURCHASE_ORDERS: '/app/purchase-orders',
  ORDER_FULFILLMENT: '/app/order-fulfillment',
  SALES: '/app/sales',
  STOCK_TRANSFER: '/app/stock-transfer',
  FORECASTING: '/app/forecasting',
  REPORTS: '/app/reports',
  SETTINGS: '/app/settings',
}

export const MODAL_IDS = {
  CREATE_ITEM: 'modal_create_item',
  EDIT_ITEM: 'modal_edit_item',
  DELETE_ITEM: 'modal_delete_item',
  CREATE_LOCATION: 'modal_create_location',
  EDIT_LOCATION: 'modal_edit_location',
  DELETE_LOCATION: 'modal_delete_location',
  CREATE_VENDOR: 'modal_create_vendor',
  EDIT_VENDOR: 'modal_edit_vendor',
  DELETE_VENDOR: 'modal_delete_vendor',
  CREATE_CUSTOMER: 'modal_create_customer',
  EDIT_CUSTOMER: 'modal_edit_customer',
  DELETE_CUSTOMER: 'modal_delete_customer',
  CREATE_USER: 'modal_create_user',
  EDIT_USER: 'modal_edit_user',
  DELETE_USER: 'modal_delete_user',
  ADJUST_INVENTORY: 'modal_adjust_inventory',
  CREATE_PO: 'modal_create_po',
  RECEIVE_PO: 'modal_receive_po',
  RECEIVE_ORDER: 'modal_receive_order',
  IMPORT_SALES: 'modal_import_sales',
}

export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
  PERSISTENT: 0,
}
