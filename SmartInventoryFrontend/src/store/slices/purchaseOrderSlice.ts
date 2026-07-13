import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseOrderState } from '@/types/purchaseorder'

const initialState: PurchaseOrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchPOs = createAsyncThunk('po/fetch', async ({ skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    const response = await purchaseOrderService.getPurchaseOrders(skip, take)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchPOById = createAsyncThunk('po/fetchById', async (id: number, { rejectWithValue }) => {
  try {
    return (await purchaseOrderService.getPurchaseOrderById(id)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const createPO = createAsyncThunk('po/create', async (data: CreatePurchaseOrderRequest, { rejectWithValue }) => {
  try {
    return (await purchaseOrderService.createPurchaseOrder(data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const updatePO = createAsyncThunk('po/update', async ({ id, data }: any, { rejectWithValue }) => {
  try {
    return (await purchaseOrderService.updatePurchaseOrder(id, data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const deletePO = createAsyncThunk('po/delete', async (id: number, { rejectWithValue }) => {
  try {
    await purchaseOrderService.deletePurchaseOrder(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const poSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPOs.pending, (state) => { state.loading = true })
      .addCase(fetchPOs.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload?.data || []
        state.total = action.payload?.total || 0
        state.skip = action.payload?.skip || 0
        state.take = action.payload?.take || 10
      })
      .addCase(fetchPOs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchPOById.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(createPO.fulfilled, (state, action) => {
        state.orders.push(action.payload)
      })
      .addCase(updatePO.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.orders[idx] = action.payload
      })
      .addCase(deletePO.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o.id !== action.payload)
      })
  },
})

export const { clearError } = poSlice.actions
export default poSlice.reducer
