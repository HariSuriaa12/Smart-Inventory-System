import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderFulfillmentService } from '@/services/orderFulfillmentService'
import { OrderFulfillment, ReceiveOrderFulfillmentRequest, OrderFulfillmentState } from '@/types/orderfulfillment'

const initialState: OrderFulfillmentState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchOrderFulfillments = createAsyncThunk('of/fetch', async (params: any, { rejectWithValue }) => {
  try {
    const { skip = 0, take = 10, ...filters } = params
    const response = await orderFulfillmentService.getAllOrderFulfillments(skip, take, filters)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchOrderById = createAsyncThunk('of/fetchById', async (id: number, { rejectWithValue }) => {
  try {
    return (await orderFulfillmentService.getOrderById(id)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const receiveOrder = createAsyncThunk('of/receive', async ({ id, data }: any, { rejectWithValue }) => {
  try {
    return (await orderFulfillmentService.receiveOrder(id, data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const ofSlice = createSlice({
  name: 'orderFulfillment',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderFulfillments.pending, (state) => { state.loading = true })
      .addCase(fetchOrderFulfillments.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload?.data || []
        state.total = action.payload?.total || 0
        state.skip = action.payload?.skip || 0
        state.take = action.payload?.take || 10
      })
      .addCase(fetchOrderFulfillments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload
      })
      .addCase(receiveOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.orders[idx] = action.payload
        state.currentOrder = action.payload
      })
  },
})

export const { clearError } = ofSlice.actions
export default ofSlice.reducer
