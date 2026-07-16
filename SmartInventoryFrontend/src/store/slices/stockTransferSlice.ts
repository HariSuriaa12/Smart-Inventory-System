import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { stockTransferService } from '@/services/stockTransferService'
import { StockTransfer, CreateStockTransferRequest, UpdateStockTransferRequest, StockTransferState, StockTransferStatus } from '@/types/stocktransfer'

const initialState: StockTransferState = {
  transfers: [],
  currentTransfer: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

interface FetchTransfersParams {
  skip?: number
  take?: number
  id?: number
  status?: StockTransferStatus
  transferType?: 'shipped' | 'received'
  fromLocationId?: number
  toLocationId?: number
  itemId?: number
  dateFrom?: string
  dateTo?: string
}

export const fetchTransfers = createAsyncThunk('st/fetch', async (params: FetchTransfersParams, { rejectWithValue }) => {
  try {
    return (await stockTransferService.getTransfers(params)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchTransferById = createAsyncThunk('st/fetchById', async (id: number, { rejectWithValue }) => {
  try {
    return (await stockTransferService.getTransferById(id)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const createTransfer = createAsyncThunk('st/create', async (data: CreateStockTransferRequest, { rejectWithValue }) => {
  try {
    return (await stockTransferService.createTransfer(data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const updateTransfer = createAsyncThunk('st/update', async ({ id, data }: any, { rejectWithValue }) => {
  try {
    return (await stockTransferService.updateTransfer(id, data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const deleteTransfer = createAsyncThunk('st/delete', async (id: number, { rejectWithValue }) => {
  try {
    await stockTransferService.deleteTransfer(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const receiveStock = createAsyncThunk('st/receive', async ({ id, receivedQuantity, remark }: any, { rejectWithValue }) => {
  try {
    return (await stockTransferService.receiveStock(id, receivedQuantity, remark)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const cancelTransfer = createAsyncThunk('st/cancel', async ({ id, remark }: any, { rejectWithValue }) => {
  try {
    return (await stockTransferService.cancelTransfer(id, remark)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const cancelTransferWithReturn = createAsyncThunk('st/cancelReturn', async ({ id, remark }: any, { rejectWithValue }) => {
  try {
    return (await stockTransferService.cancelTransferWithReturn(id, remark)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const stSlice = createSlice({
  name: 'stockTransfer',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => { state.loading = true })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false
        state.transfers = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.transfers.push(action.payload)
      })
      .addCase(updateTransfer.fulfilled, (state, action) => {
        const idx = state.transfers.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.transfers[idx] = action.payload
      })
      .addCase(deleteTransfer.fulfilled, (state, action) => {
        state.transfers = state.transfers.filter((t) => t.id !== action.payload)
      })
      .addCase(receiveStock.fulfilled, (state, action) => {
        const idx = state.transfers.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.transfers[idx] = action.payload
      })
      .addCase(cancelTransfer.fulfilled, (state, action) => {
        const idx = state.transfers.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.transfers[idx] = action.payload
      })
      .addCase(cancelTransferWithReturn.fulfilled, (state, action) => {
        const idx = state.transfers.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.transfers[idx] = action.payload
      })
  },
})

export const { clearError } = stSlice.actions
export default stSlice.reducer
