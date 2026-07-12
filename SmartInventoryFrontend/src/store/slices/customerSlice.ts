import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerService } from '@/services/customerService'
import { Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerState } from '@/types/customer'

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchCustomers = createAsyncThunk('customers/fetch', async ({ skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    return (await customerService.getCustomers(skip, take)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const createCustomer = createAsyncThunk('customers/create', async (data: CreateCustomerRequest, { rejectWithValue }) => {
  try {
    return (await customerService.createCustomer(data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, data }: any, { rejectWithValue }) => {
  try {
    return (await customerService.updateCustomer(id, data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const deleteCustomer = createAsyncThunk('customers/delete', async (id: number, { rejectWithValue }) => {
  try {
    await customerService.deleteCustomer(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.loading = true })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        console.log('Fetched customers:', action.payload) // Debugging log
        state.loading = false
        state.customers = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers.push(action.payload)
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const idx = state.customers.findIndex((c) => c.id === action.payload.id)
        if (idx !== -1) state.customers[idx] = action.payload
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter((c) => c.id !== action.payload)
      })
  },
})

export const { clearError } = customerSlice.actions
export default customerSlice.reducer
