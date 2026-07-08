import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { locationService } from '@/services/locationService'
import { Location, CreateLocationRequest, UpdateLocationRequest, LocationState } from '@/types/location'

const initialState: LocationState = {
  locations: [],
  currentLocation: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchLocations = createAsyncThunk('locations/fetchLocations',
  async ({ skip = 0, take = 10 }: { skip?: number; take?: number }, { rejectWithValue }) => {
    try {
      return (await locationService.getLocations(skip, take)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchLocationById = createAsyncThunk('locations/fetchLocationById',
  async (id: number, { rejectWithValue }) => {
    try {
      return (await locationService.getLocationById(id)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createLocation = createAsyncThunk('locations/createLocation',
  async (data: CreateLocationRequest, { rejectWithValue }) => {
    try {
      return (await locationService.createLocation(data)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateLocation = createAsyncThunk('locations/updateLocation',
  async ({ id, data }: { id: number; data: UpdateLocationRequest }, { rejectWithValue }) => {
    try {
      return (await locationService.updateLocation(id, data)).data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteLocation = createAsyncThunk('locations/deleteLocation',
  async (id: number, { rejectWithValue }) => {
    try {
      await locationService.deleteLocation(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setCrudStates = (action: string, thunk: any) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true
          state.error = null
        })
    }
    
    builder
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false
        state.locations = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false
        state.locations.push(action.payload)
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.locations.findIndex((l) => l.id === action.payload.id)
        if (idx !== -1) state.locations[idx] = action.payload
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false
        state.locations = state.locations.filter((l) => l.id !== action.payload)
      })
  },
})

export const { clearError } = locationSlice.actions
export default locationSlice.reducer
