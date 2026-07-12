import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { inventoryService } from '@/services/inventoryService'
import { Inventory, AdjustInventoryRequest, StockTransferRequest, InventoryState } from '@/types/inventory'

const initialState: InventoryState = {
  inventory: [],
  currentInventory: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchInventoryByLocation = createAsyncThunk(
  'inventory/fetchByLocation',
  async ({ locationId, skip = 0, take = 10, searchQuery }: any, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryByLocation(locationId, skip, take, searchQuery)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchInventoryByItem = createAsyncThunk(
  'inventory/fetchByItem',
  async ({ itemId, skip = 0, take = 10 }: any, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryByItem(itemId, skip, take)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const adjustInventory = createAsyncThunk(
  'inventory/adjust',
  async (data: AdjustInventoryRequest, { rejectWithValue }) => {
    try {
      const response = await inventoryService.adjustInventory(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const transferStock = createAsyncThunk(
  'inventory/transfer',
  async (data: StockTransferRequest, { rejectWithValue }) => {
    try {
      const response = await inventoryService.transferStock(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryByLocation.pending, (state) => { state.loading = true })
      .addCase(fetchInventoryByLocation.fulfilled, (state, action) => {
        state.loading = false
        state.inventory = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchInventoryByLocation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(adjustInventory.fulfilled, (state, action) => {
        const idx = state.inventory.findIndex((i) => i.ID === action.payload.ID)
        if (idx !== -1) {
          state.inventory[idx] = action.payload
        }
      })
      .addCase(transferStock.fulfilled, (state, action) => {
        const idx = state.inventory.findIndex((i) => i.ID === action.payload.ID)
        if (idx !== -1) {
          state.inventory[idx] = action.payload
        }
      })
  },
})

export const { clearError } = inventorySlice.actions
export default inventorySlice.reducer
