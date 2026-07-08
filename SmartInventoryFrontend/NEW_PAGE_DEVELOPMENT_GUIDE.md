# Smart Inventory Frontend - New Page Development Guide

**A Step-by-Step Guide to Building a Complete Feature with API Integration**

---

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Step 1: Define Types](#step-1-define-types)
3. [Step 2: Create API Service](#step-2-create-api-service)
4. [Step 3: Build Redux Slice](#step-3-build-redux-slice)
5. [Step 4: Create Page Component](#step-4-create-page-component)
6. [Step 5: Create Supporting Components](#step-5-create-supporting-components)
7. [Step 6: Add Routing](#step-6-add-routing)
8. [Step 7: Test Everything](#step-7-test-everything)
9. [Complete Example: Items Page](#complete-example-items-page)

---

## 🏗️ Architecture Overview

The application follows this data flow:

```
User Action (Click Button)
         ↓
Page Component dispatches Redux Action
         ↓
Redux Thunk (async action)
         ↓
API Service calls backend
         ↓
Response returned
         ↓
Redux updates state
         ↓
Component re-renders with new data
```

### Key Layers:

```
Pages/              - User-facing page components
   ├── ItemsPage.tsx
   ├── ItemList.tsx
   ├── ItemForm.tsx
   └── ItemDetail.tsx

Store/              - Redux state management
   └── slices/
       └── itemSlice.ts

Services/           - API communication
   └── itemService.ts

Types/              - TypeScript interfaces
   └── item.ts

Components/         - Reusable UI components
```

---

## 📝 Step 1: Define Types

### Create/Update: `src/types/item.ts`

This file defines all TypeScript interfaces for your data. Always start here!

```typescript
// 1. Main entity interface
export interface Item extends Entity {
  itemName: string
  itemCode: string
  description?: string
  itemCategory: string
  itemBrand?: string
  purchaseCost: number
  unitCost: number
  isActive: boolean
  unitOfMeasure: string
  remark?: string
  itemImageUrl?: string
  taxPercentage?: number
  taxType?: string
  itemType?: string
}

// 2. Request DTOs (for POST/PUT operations)
export interface CreateItemRequest {
  itemName: string
  itemCode: string
  description?: string
  itemCategory: string
  itemBrand?: string
  purchaseCost: number
  unitCost: number
  isActive: boolean
  unitOfMeasure: string
  remark?: string
  itemImageUrl?: string
  taxPercentage?: number
  taxType?: string
  itemType?: string
}

export interface UpdateItemRequest {
  itemName?: string
  itemCode?: string
  description?: string
  itemCategory?: string
  itemBrand?: string
  purchaseCost?: number
  unitCost?: number
  isActive?: boolean
  unitOfMeasure?: string
  remark?: string
  itemImageUrl?: string
  taxPercentage?: number
  taxType?: string
  itemType?: string
}

// 3. Filter/Query interfaces
export interface ItemFilters {
  skip: number
  take: number
  searchQuery?: string
  category?: string
  isActive?: boolean
}

// 4. Redux state interface
export interface ItemState {
  items: Item[]
  currentItem: Item | null
  loading: boolean
  error: string | null
  total: number
  skip: number
  take: number
}
```

**Why this matters:**
- ✅ Ensures type safety across your app
- ✅ Catches errors at compile time
- ✅ Auto-complete in IDE
- ✅ Documents what API returns

---

## 🔌 Step 2: Create API Service

### Create: `src/services/itemService.ts`

This layer handles ALL communication with the backend.

```typescript
import { api } from './api'
import { ApiResponse, PaginatedResponse } from '@/types/common'
import { Item, CreateItemRequest, UpdateItemRequest } from '@/types/item'

export const itemService = {
  // GET all items with pagination
  getItems: async (skip: number = 0, take: number = 10) =>
    (await api.get<ApiResponse<PaginatedResponse<Item>>>('/api/items', {
      params: { skip, take },
    })).data,

  // GET single item by ID
  getItemById: async (id: number) =>
    (await api.get<ApiResponse<Item>>(`/api/items/${id}`)).data,

  // POST create new item
  createItem: async (data: CreateItemRequest) =>
    (await api.post<ApiResponse<Item>>('/api/items', data)).data,

  // PUT update existing item
  updateItem: async (id: number, data: UpdateItemRequest) =>
    (await api.put<ApiResponse<Item>>(`/api/items/${id}`, data)).data,

  // DELETE item
  deleteItem: async (id: number) =>
    (await api.delete<ApiResponse<void>>(`/api/items/${id}`)).data,

  // Optional: GET by category
  getByCategory: async (category: string) =>
    (await api.get<ApiResponse<Item[]>>(`/api/items/category/${category}`)).data,
}
```

**Key Points:**
- ✅ Methods return typed responses
- ✅ Encapsulates all API URLs
- ✅ Handles errors automatically (via api.ts interceptors)
- ✅ Easy to test/mock
- ✅ Centralized - change URL once, updates everywhere

---

## 🧠 Step 3: Build Redux Slice

### Create: `src/store/slices/itemSlice.ts`

Redux manages your application state. This is where data lives.

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { itemService } from '@/services/itemService'
import { Item, CreateItemRequest, UpdateItemRequest, ItemState } from '@/types/item'

const initialState: ItemState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

// ============ ASYNC THUNKS (API calls) ============

// Fetch all items
export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async ({ skip = 0, take = 10 }: { skip?: number; take?: number }, { rejectWithValue }) => {
    try {
      return (await itemService.getItems(skip, take)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch single item
export const fetchItemById = createAsyncThunk(
  'items/fetchItemById',
  async (id: number, { rejectWithValue }) => {
    try {
      return (await itemService.getItemById(id)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Create new item
export const createItem = createAsyncThunk(
  'items/createItem',
  async (data: CreateItemRequest, { rejectWithValue }) => {
    try {
      return (await itemService.createItem(data)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Update item
export const updateItem = createAsyncThunk(
  'items/updateItem',
  async ({ id, data }: { id: number; data: UpdateItemRequest }, { rejectWithValue }) => {
    try {
      return (await itemService.updateItem(id, data)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete item
export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (id: number, { rejectWithValue }) => {
    try {
      await itemService.deleteItem(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// ============ SLICE ============

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload
    },
    clearCurrentItem: (state) => {
      state.currentItem = null
    },
  },
  extraReducers: (builder) => {
    // Handle fetchItems
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.data || []
        state.total = action.payload?.total || 0
        state.skip = action.payload?.skip || 0
        state.take = action.payload?.take || 10
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Handle fetchItemById
    builder
      .addCase(fetchItemById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        state.loading = false
        state.currentItem = action.payload
      })
      .addCase(fetchItemById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Handle createItem
    builder
      .addCase(createItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
        state.total += 1
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Handle updateItem
    builder
      .addCase(updateItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.currentItem = action.payload
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Handle deleteItem
    builder
      .addCase(deleteItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.total -= 1
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null
        }
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentItem, clearCurrentItem } = itemSlice.actions
export default itemSlice.reducer
```

**What's Happening:**
- ✅ Async thunks = API calls with loading/error states
- ✅ Reducers = state updates
- ✅ When API succeeds → state updates
- ✅ When API fails → error stored in state
- ✅ Components re-render automatically

---

## 🎨 Step 4: Create Page Component

### Create: `src/pages/masterdata/items/ItemsPage.tsx`

This is the main page component that users see.

```typescript
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchItems, deleteItem } from '@/store/slices/itemSlice'
import { useNotification, usePagination } from '@/hooks'
import { Card, Button, Spinner, Alert } from '@/components'
import { Plus, Search } from 'lucide-react'
import { ItemList } from './ItemList'
import { ItemForm } from './ItemForm'
import { Input } from '@/components'

export const ItemsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading, error, total } = useAppSelector((state) => state.items)
  const { skip, take, goToPage, changePageSize, currentPage, totalPages } = usePagination()
  const { success, error: showError } = useNotification()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Fetch items on mount and when pagination changes
  useEffect(() => {
    dispatch(fetchItems({ skip, take }))
  }, [skip, take, dispatch])

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await dispatch(deleteItem(id))
      success('Item deleted successfully')
      dispatch(fetchItems({ skip, take }))
    }
  }

  // Show error alert if any
  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Create Item
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="secondary">
            <Search size={20} />
          </Button>
        </div>
      </Card>

      {/* Error Alert */}
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {/* Loading State */}
      {loading && <Spinner text="Loading items..." />}

      {/* Items List */}
      {!loading && (
        <>
          <ItemList items={items} onDelete={handleDelete} onEdit={(item) => {}} />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {skip + 1} to {Math.min(skip + take, total)} of {total} items
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <ItemForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  )
}
```

**Key Concepts:**
- ✅ Fetch data in useEffect
- ✅ Get data from Redux store
- ✅ Dispatch actions for CRUD
- ✅ Show loading/error states
- ✅ Use custom hooks (usePagination, useNotification)

---

## 🧩 Step 5: Create Supporting Components

### Create: `src/pages/masterdata/items/ItemList.tsx`

Displays the list of items in a table.

```typescript
import { Item } from '@/types/item'
import { Card, Badge } from '@/components'
import { Edit2, Trash2 } from 'lucide-react'

interface ItemListProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (id: number) => void
}

export const ItemList: React.FC<ItemListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600">No items found</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Cost</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{item.itemName}</td>
                <td className="py-3 px-4 text-gray-600">{item.itemCode}</td>
                <td className="py-3 px-4 text-gray-600">{item.itemCategory}</td>
                <td className="py-3 px-4 text-right text-gray-900">${item.unitCost.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={item.isActive ? 'success' : 'warning'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
```

### Create: `src/pages/masterdata/items/ItemForm.tsx`

Form for creating/editing items.

```typescript
import { useAppDispatch } from '@/store/hooks'
import { createItem } from '@/store/slices/itemSlice'
import { useForm, useNotification } from '@/hooks'
import { CreateItemRequest } from '@/types/item'
import { Modal, Button, Input, Select } from '@/components'

interface ItemFormProps {
  onClose: () => void
  item?: any // For edit mode
}

export const ItemForm: React.FC<ItemFormProps> = ({ onClose, item }) => {
  const dispatch = useAppDispatch()
  const { success, error: showError } = useNotification()

  const { values, errors, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm({
    initialValues: item || {
      itemName: '',
      itemCode: '',
      description: '',
      itemCategory: '',
      itemBrand: '',
      purchaseCost: 0,
      unitCost: 0,
      isActive: true,
      unitOfMeasure: 'Unit',
    },
    validate: (values) => {
      const errors: Record<string, string> = {}
      if (!values.itemName) errors.itemName = 'Item name is required'
      if (!values.itemCode) errors.itemCode = 'Item code is required'
      if (!values.itemCategory) errors.itemCategory = 'Category is required'
      return errors
    },
    onSubmit: async (formValues) => {
      try {
        await dispatch(createItem(formValues as CreateItemRequest))
        success('Item created successfully')
        onClose()
      } catch (err: any) {
        showError(err.message)
      }
    },
  })

  return (
    <Modal isOpen={true} title="Create Item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          name="itemName"
          value={values.itemName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.itemName}
          fullWidth
        />

        <Input
          label="Item Code"
          name="itemCode"
          value={values.itemCode}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.itemCode}
          fullWidth
        />

        <Input
          label="Category"
          name="itemCategory"
          value={values.itemCategory}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.itemCategory}
          fullWidth
        />

        <Input
          label="Unit Cost"
          name="unitCost"
          type="number"
          value={values.unitCost}
          onChange={handleChange}
          fullWidth
        />

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Item
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

---

## 🛣️ Step 6: Add Routing

### Update: `src/App.tsx`

Add your new page to the routes:

```typescript
import { ItemsPage } from '@/pages/masterdata/items/ItemsPage'

// Inside the MainLayout routes section:
<Route path="/app/master-data/items" element={<ItemsPage />} />
```

### Update: `src/store/store.ts`

Add your new slice to Redux:

```typescript
import itemReducer from './slices/itemSlice'

export const store = configureStore({
  reducer: {
    // ... other slices
    items: itemReducer,
  },
})
```

---

## 🧪 Step 7: Test Everything

### Checklist:

- [ ] **API Connection**
  - Open browser DevTools → Network tab
  - Click "Create Item" button
  - Verify API call to `/api/items`
  - Check response status 200
  - Verify data structure matches your types

- [ ] **Redux State**
  - Install [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmjabafklmklbklregklomefigefegjj)
  - Open Redux tab in DevTools
  - Dispatch an action (fetch/create/delete)
  - See state changes in real-time
  - Verify old state → new state transition

- [ ] **Loading States**
  - Click fetch button
  - Spinner should appear
  - After response: spinner disappears, data shows

- [ ] **Error Handling**
  - Close backend API
  - Try to fetch
  - Error message should display
  - Open backend again
  - Retry should work

- [ ] **Pagination**
  - Multiple items with pagination
  - Click "Next" button
  - URL updates, new items load
  - Skip/take params sent to API

- [ ] **Form Validation**
  - Submit empty form
  - Error messages appear under fields
  - Fill fields
  - Submit button enables
  - API call succeeds
  - List updates with new item

---

## 📖 Complete Example: Items Page

Here's the full directory structure:

```
src/pages/masterdata/items/
├── ItemsPage.tsx          ← Main page component
├── ItemList.tsx           ← Display items in table
├── ItemForm.tsx           ← Create/edit form
├── ItemDetail.tsx         ← View single item (optional)
└── index.ts               ← Exports
```

### File Creation Sequence:

1. **types/item.ts** - ✅ Interfaces
2. **services/itemService.ts** - ✅ API calls
3. **store/slices/itemSlice.ts** - ✅ Redux state
4. **pages/masterdata/items/ItemList.tsx** - ✅ List component
5. **pages/masterdata/items/ItemForm.tsx** - ✅ Form component
6. **pages/masterdata/items/ItemsPage.tsx** - ✅ Main page
7. **pages/masterdata/items/index.ts** - ✅ Export
8. **App.tsx** - ✅ Add route
9. **store/store.ts** - ✅ Add slice
10. **Test everything!** - ✅ Manual testing

---

## 🔄 Data Flow Diagram

```
ItemsPage Component
       ↓
   [Click "Fetch"]
       ↓
dispatch(fetchItems({ skip, take }))
       ↓
itemSlice.ts (async thunk)
       ↓
itemService.fetchItems()
       ↓
API Service (api.ts)
       ↓
GET https://localhost:62549/api/items?skip=0&take=10
       ↓
Backend Response
{
  "success": true,
  "data": {
    "data": [...items],
    "total": 100,
    "skip": 0,
    "take": 10
  }
}
       ↓
Redux Slice receives data
       ↓
State updates:
{
  items: [...],
  total: 100,
  loading: false,
  error: null
}
       ↓
Component re-renders
       ↓
Table shows items!
```

---

## 💡 Pro Tips

### 1. **Always Start with Types**
Don't guess the API response structure. Look at backend code first.

### 2. **Test API First**
Use Postman/Insomnia to verify the API works before building UI.

### 3. **Use Redux DevTools**
Browser extension shows exact state changes and allows time-travel debugging.

### 4. **Reuse Components**
- Button, Input, Modal, Card are already built
- Compose them together
- Don't rebuild existing components

### 5. **Error Handling Pattern**
```typescript
try {
  await dispatch(action())
  showSuccess('Success message')
} catch (error) {
  showError('Error message')
}
```

### 6. **Loading Pattern**
```typescript
{loading && <Spinner text="Loading..." />}
{!loading && <YourContent />}
```

### 7. **Form Validation Pattern**
```typescript
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { ... },
  validate: (values) => {
    const errors = {}
    if (!values.name) errors.name = 'Required'
    return errors
  },
  onSubmit: async (values) => { ... },
})
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/pages/masterdata/items'"
**Solution:** Create the index.ts file
```bash
touch src/pages/masterdata/items/index.ts
echo "export { ItemsPage } from './ItemsPage'" > src/pages/masterdata/items/index.ts
```

### Issue: "undefined is not a function" when accessing items
**Solution:** Check Redux slice is added to store.ts
```typescript
import itemReducer from './slices/itemSlice'
const store = configureStore({
  reducer: { items: itemReducer }
})
```

### Issue: API call not working
**Solution:** 
- Check backend is running
- Verify endpoint in Network tab
- Look for 401 errors → token issue
- Look for 404 errors → wrong URL

### Issue: State doesn't update after API call
**Solution:** 
- Check async thunk is dispatched correctly
- Verify extraReducers handle all cases
- Check Redux DevTools for action dispatch

### Issue: Form not submitting
**Solution:**
- Verify form validation passes
- Check handleSubmit is attached to form
- Check button type="submit"
- Look at console for errors

---

## 📋 Checklist: Building a New Page

Use this checklist every time you build a new page:

- [ ] Created types in `types/[feature].ts`
- [ ] Created service in `services/[feature]Service.ts`
- [ ] Created slice in `store/slices/[feature]Slice.ts`
- [ ] Added slice to `store/store.ts`
- [ ] Created page component `pages/[path]/[Feature]Page.tsx`
- [ ] Created supporting components (List, Form, etc.)
- [ ] Created index.ts file for exports
- [ ] Added route to `App.tsx`
- [ ] Tested API call in Network tab
- [ ] Tested Redux state in DevTools
- [ ] Tested loading/error states
- [ ] Tested form validation
- [ ] Tested pagination/filtering
- [ ] Verified UI looks good

---

## 🚀 Next Steps

Once you master this pattern, you can build any page:
1. Items ✅ (done in this guide)
2. Locations (same pattern)
3. Vendors (same pattern)
4. Customers (same pattern)
5. Users (same pattern)
6. Purchase Orders (similar, with more complexity)
7. etc...

**The pattern is always the same!**

---

## 📞 Quick Reference

| Need | File | Example |
|------|------|---------|
| Data types | `types/item.ts` | `interface Item` |
| API calls | `services/itemService.ts` | `getItems()` |
| State management | `store/slices/itemSlice.ts` | `fetchItems` thunk |
| UI components | `components/common/Button.tsx` | Already built |
| Page layout | `pages/masterdata/items/ItemsPage.tsx` | Your page |

---

**Happy Building! 🎉**

Follow this guide step-by-step and you'll build robust, type-safe pages that integrate perfectly with your backend API.
