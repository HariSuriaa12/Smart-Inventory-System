# Purchase Order Module Implementation Guide

## Overview
This guide documents the frontend implementation for the Purchase Order (PO) module with support for creating, viewing, editing, and receiving purchase orders.

## Created Files

### Pages
1. **`src/pages/purchase-order/index.ts`**
   - Exports for all purchase order pages

2. **`src/pages/purchase-order/PurchaseOrderListPage.tsx`**
   - Displays list of all purchase orders
   - Features:
     - Search by PO reference and vendor
     - Filter by status
     - Pagination support
     - Create new PO button
     - Double-click row to view details

3. **`src/pages/purchase-order/PurchaseOrderDetailPage.tsx`**
   - Displays detailed view of a single purchase order
   - Features:
     - View PO header information (vendor, location, total amount)
     - View all items in the PO with quantities and prices
     - Edit PO remarks (only when status = Saved/0)
     - Add new items (only when status = Saved/0)
     - Receive items (double-click item row when status != Saved)
     - Display current status with color-coded badges

### Modals

1. **`src/components/modals/CreatePurchaseOrderModal.tsx`**
   - Create new purchase order with items
   - Features:
     - Select location and vendor
     - Add multiple items with search functionality
     - Set order quantity and unit price
     - View total amount calculation
     - Validate all required fields

2. **`src/components/modals/EditPurchaseOrderModal.tsx`**
   - Edit existing purchase order information
   - Features:
     - Update remarks/comments
     - Only available when PO status = Saved (0)
     - Shows informational message about editing constraints

3. **`src/components/modals/AddPurchaseOrderItemModal.tsx`**
   - Add new item to existing purchase order
   - Features:
     - Search for items by name or code
     - Set quantity and unit price
     - Display selected item details
     - Calculate total amount
     - Note: Backend endpoint implementation required

4. **`src/components/modals/ReceivePurchaseOrderModal.tsx`**
   - Record receipt of purchased items
   - Features:
     - Display item details and current received quantity
     - Input received quantity with validation
     - Prevent receiving more than ordered
     - Auto-update PO status based on total received
     - Only available when PO status != Saved

## Status Enum Reference

```typescript
enum PurchaseOrderStatus {
  Saved = 0,              // Initial status, can edit and add items
  Confirmed = 1,          // PO confirmed with vendor
  PartiallyReceived = 2,  // Some items received
  Received = 3,           // All items received
  Cancelled = 4           // PO cancelled
}
```

## Backend Endpoints Required

### Existing Endpoints (Already Implemented)
- `GET /api/purchaseorders` - Get all POs with pagination
- `GET /api/purchaseorders/{id}` - Get PO by ID
- `POST /api/purchaseorders` - Create new PO with items
- `PUT /api/purchaseorders/{id}` - Update PO (remarks, status)
- `DELETE /api/purchaseorders/{id}` - Delete PO
- `POST /api/purchaseorders/{id}/receive` - Receive items

### New Endpoints Required (Frontend Ready)

1. **Add Item to Purchase Order**
   ```
   POST /api/purchaseorders/{id}/items
   Request Body:
   {
     "itemId": number,
     "orderQuantity": number,
     "unitPrice": number
   }
   Response: PurchaseOrder (updated)
   ```

2. **Remove Item from Purchase Order**
   ```
   DELETE /api/purchaseorders/{id}/items/{itemId}
   Response: PurchaseOrder (updated)
   ```

## Integration Steps

### 1. Add Routes to Router
Add the following routes to your main router configuration:

```typescript
import { PurchaseOrderListPage, PurchaseOrderDetailPage } from '@/pages/purchase-order'

// In your route configuration:
{
  path: '/purchase-orders',
  element: <PurchaseOrderListPage />
},
{
  path: '/purchase-orders/:id',
  element: <PurchaseOrderDetailPage />
}
```

### 2. Navigation Menu Item
Add to your navigation menu:

```typescript
{
  label: 'Purchase Orders',
  icon: <ShoppingCart />,
  path: '/purchase-orders'
}
```

### 3. Backend Implementation Checklist
- [ ] Implement `POST /api/purchaseorders/{id}/items` endpoint
- [ ] Implement `DELETE /api/purchaseorders/{id}/items/{itemId}` endpoint
- [ ] Ensure PO status updates automatically based on received quantities:
  - If all items fully received → Status = Received (3)
  - If some items partially received → Status = PartiallyReceived (2)
  - If no items received yet → Keep current status
- [ ] Validate received quantity cannot exceed ordered quantity
- [ ] Maintain referential integrity with items and inventory

## Key Features

### 1. Create Purchase Order
- Select vendor and location
- Search and add multiple items
- Set order quantity and unit price for each item
- View real-time total calculation
- Submit to create saved PO

### 2. View Purchase Orders
- List view with pagination
- Search by PO reference number and vendor
- Filter by status
- Click to view details
- Color-coded status badges

### 3. View PO Details
- Header information (vendor, location, total amount)
- Items table with quantities and prices
- Current status and creation info
- Action buttons based on status

### 4. Edit PO (Status = Saved Only)
- Update remarks/comments
- Cannot change location, vendor, or items
- Changes reflected immediately

### 5. Add Items (Status = Saved Only)
- Search for items
- Set quantities and prices
- Add multiple items iteratively
- Updates PO total automatically

### 6. Receive Items
- Available for Confirmed, Partially Received statuses
- Update received quantity
- Automatic status update
- Prevent over-receiving
- Double-click item to receive

## Form Validations

### Create PO
- Location: Required
- Vendor: Required
- Items: At least one item required
- Item Qty: Must be > 0
- Unit Price: Must be > 0

### Add Item
- Item: Must select from dropdown
- Quantity: Must be > 0
- Unit Price: Must be > 0
- Item cannot already be in PO

### Receive Item
- Received Qty: Must be between 0 and Order Quantity
- Cannot exceed total ordered amount

## Data Types

### PurchaseOrderItem
```typescript
interface PurchaseOrderItem {
  id: number
  PO_Id: number
  Item_Id: number
  Order_Quantity: number
  Unit_Price: number
  Status: PurchaseOrderStatus
  Sub_Total: number
  Received_Quantity: number
  item?: Item
}
```

### PurchaseOrder
```typescript
interface PurchaseOrder {
  id: number
  PO_Reference_No: string
  Location_Id: number
  Purchase_Date: string | Date
  Purchase_Time: string
  Vendor_Id: number
  Status: PurchaseOrderStatus
  Remark?: string
  Performed_By: number
  Total_Amount: number
  Items?: PurchaseOrderItem[]
  Location?: Location
  Vendor?: Vendor
  performed_ByUser?: User
}
```

## Redux Store Integration

The module uses Redux for state management:
- `store/slices/purchaseOrderSlice.ts` - Already configured
- Available thunks:
  - `fetchPOs` - Get all purchase orders
  - `fetchPOById` - Get single PO
  - `createPO` - Create new PO
  - `updatePO` - Update PO
  - `deletePO` - Delete PO

## Service Layer

The `purchaseOrderService` includes:
- `getPurchaseOrders(skip, take)` - List POs
- `getPurchaseOrderById(id)` - Get PO details
- `createPurchaseOrder(data)` - Create PO
- `updatePurchaseOrder(id, data)` - Update PO
- `deletePurchaseOrder(id)` - Delete PO
- `receivePurchaseOrderItem(id, data)` - Receive items
- `addItemToPO(id, itemData)` - Add item (needs backend)
- `removeItemFromPO(id, itemId)` - Remove item (needs backend)

## UI Components Used

- `DataGrid` - For displaying lists and item tables
- `Card` - For container sections
- `Input` - For text inputs
- `Select` - For dropdowns (custom select elements)
- `Modal` - For dialogs
- Icons from `lucide-react` - UI icons

## Color Scheme

Status badge colors:
- Saved: Blue (bg-blue-100 text-blue-800)
- Confirmed: Purple (bg-purple-100 text-purple-800)
- Partially Received: Yellow (bg-yellow-100 text-yellow-800)
- Received: Green (bg-green-100 text-green-800)
- Cancelled: Red (bg-red-100 text-red-800)

## Notes

1. **Backend Dependency**: The full functionality depends on backend endpoints. The frontend is prepared for all features but some operations will fail until backend implements the required endpoints.

2. **Auto-status Updates**: Status should be automatically updated by the backend based on received quantities to maintain consistency.

3. **Item Search**: Item selection uses debounced search (300ms) to avoid excessive API calls.

4. **Date/Time**: Purchase orders use system date/time for creation. Modify if custom date selection is needed.

5. **Permissions**: Consider adding role-based access control in the detail page for operations like edit and receive.

## Testing Checklist

- [ ] Create new purchase order with multiple items
- [ ] View list of purchase orders with pagination
- [ ] Search and filter purchase orders
- [ ] View PO details and item list
- [ ] Edit PO remarks (only when Saved)
- [ ] Add items to PO (only when Saved)
- [ ] Receive items (when Confirmed or later)
- [ ] Verify status updates automatically
- [ ] Test validation messages
- [ ] Test with various status states
- [ ] Verify calculations (subtotals, totals)

## Future Enhancements

1. Bulk operations (receive multiple items at once)
2. PO confirmation workflow
3. Print/Export PO functionality
4. Attachment support (invoice, delivery note)
5. Notes/comments history
6. Change audit trail
7. Integration with purchase requisitions
8. Notifications for approval/delivery
