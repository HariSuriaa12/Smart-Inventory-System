import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { inventoryService } from '@/services/inventoryService'
import { Inventory, AdjustInventoryRequest, InventoryState } from '@/types/inventory'

const initialState: InventoryState = {
  inventory: [],
  currentInventory: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchInventory = createAsyncThunk('inventory/fetch', async ({ skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    return (await inventoryService.getInventory(skip, take)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchInventoryByLocation = createAsyncThunk('inventory/fetchByLocation', async ({ locationId, skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    return (await inventoryService.getInventoryByLocation(locationId, skip, take)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const adjustInventory = createAsyncThunk('inventory/adjust', async ({ id, data }: any, { rejectWithValue }) => {
  try {
    return (await inventoryService.adjustInventory(id, data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false
        state.inventory = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(adjustInventory.fulfilled, (state, action) => {
        const idx = state.inventory.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.inventory[idx] = action.payload
      })
  },
})

export const { clearError } = inventorySlice.actions
export default inventorySlice.reducer
