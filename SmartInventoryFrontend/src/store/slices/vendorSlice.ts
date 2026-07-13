import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vendorService } from '@/services/vendorService'
import { Vendor, CreateVendorRequest, UpdateVendorRequest, VendorState } from '@/types/vendor'

const initialState: VendorState = {
  vendors: [],
  currentVendor: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchVendors = createAsyncThunk('vendors/fetchVendors', async ({ skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    return (await vendorService.getVendors(skip, take)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const createVendor = createAsyncThunk('vendors/createVendor', async (data: CreateVendorRequest, { rejectWithValue }) => {
  try {
    return (await vendorService.createVendor(data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const updateVendor = createAsyncThunk('vendors/updateVendor', async ({ id, data }: any, { rejectWithValue }) => {
  try {
    return (await vendorService.updateVendor(id, data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const deleteVendor = createAsyncThunk('vendors/deleteVendor', async (id: number, { rejectWithValue }) => {
  try {
    await vendorService.deleteVendor(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        console.log('Fetched vendors:', action.payload) // Debugging log
        state.loading = false
        state.vendors = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.loading = false
        state.vendors.push(action.payload)
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.vendors.findIndex((v) => v.id === action.payload.id)
        if (idx !== -1) state.vendors[idx] = action.payload
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.loading = false
        state.vendors = state.vendors.filter((v) => v.id !== action.payload)
      })
  },
})

export const { clearError } = vendorSlice.actions
export default vendorSlice.reducer
