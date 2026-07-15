import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { salesService } from '@/services/salesService'
import { Sales, ReceiveSalesRequest, SalesState } from '@/types/sales'

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchSales = createAsyncThunk('sales/fetch', async ({ skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    return (await salesService.getSales(skip, take)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchSalesFiltered = createAsyncThunk(
  'sales/fetchFiltered',
  async (
    {
      skip = 0,
      take = 10,
      salesId,
      salesNumber,
      status,
      dateFrom,
      dateTo,
    }: any,
    { rejectWithValue }
  ) => {
    try {
      return (await salesService.getSalesFiltered(skip, take, salesId, salesNumber, status, dateFrom, dateTo)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSaleById = createAsyncThunk('sales/fetchById', async (id: number, { rejectWithValue }) => {
  try {
    return (await salesService.getSaleById(id)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const importSalesData = createAsyncThunk('sales/import', async (data: ReceiveSalesRequest, { rejectWithValue }) => {
  try {
    return (await salesService.receiveSalesData(data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => { state.loading = true })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false
        state.sales = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchSalesFiltered.pending, (state) => { state.loading = true })
      .addCase(fetchSalesFiltered.fulfilled, (state, action) => {
        state.loading = false
        state.sales = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchSalesFiltered.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.currentSale = action.payload
      })
      .addCase(importSalesData.pending, (state) => { state.loading = true })
      .addCase(importSalesData.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importSalesData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = salesSlice.actions
export default salesSlice.reducer
