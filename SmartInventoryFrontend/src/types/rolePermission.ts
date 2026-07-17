export interface RolePermission {
  id: number
  role_ID: number
  role_Name: string
  view_Items: boolean
  view_Locations: boolean
  view_Vendors: boolean
  view_Customers: boolean
  view_Users: boolean
  view_Inventory: boolean
  view_Purchase_Orders: boolean
  view_Order_Fulfillment: boolean
  view_Stock_Transfer: boolean
  view_Sales: boolean
  create_Data: boolean
  update_Data: boolean
  delete_Data: boolean
  created_At: string
  updated_At: string
  is_Active: boolean
}

export interface CreateRolePermissionRequest {
  role_ID: number
  role_Name?: string
  view_Items?: boolean
  view_Locations?: boolean
  view_Vendors?: boolean
  view_Customers?: boolean
  view_Users?: boolean
  view_Inventory?: boolean
  view_Purchase_Orders?: boolean
  view_Order_Fulfillment?: boolean
  view_Stock_Transfer?: boolean
  view_Sales?: boolean
  create_Data?: boolean
  update_Data?: boolean
  delete_Data?: boolean
}

export interface UpdateRolePermissionRequest {
  role_Name?: string
  view_Items?: boolean
  view_Locations?: boolean
  view_Vendors?: boolean
  view_Customers?: boolean
  view_Users?: boolean
  view_Inventory?: boolean
  view_Purchase_Orders?: boolean
  view_Order_Fulfillment?: boolean
  view_Stock_Transfer?: boolean
  view_Sales?: boolean
  create_Data?: boolean
  update_Data?: boolean
  delete_Data?: boolean
  is_Active?: boolean
}

export interface RoleDropdown {
  id: number
  role_ID: number
  role_Name: string
}
