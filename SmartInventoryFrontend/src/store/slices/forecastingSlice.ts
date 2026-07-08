import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { forecastingService } from '@/services/forecastingService'
import { ForecastedResult, ForecastingState } from '@/types/forecasting'

const initialState: ForecastingState = {
  forecasts: [],
  currentForecast: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchForecasts = createAsyncThunk('forecasting/fetch', async ({ skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    return (await forecastingService.getForecasts(skip, take)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchForecastById = createAsyncThunk('forecasting/fetchById', async (id: number, { rejectWithValue }) => {
  try {
    return (await forecastingService.getForecastById(id)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const triggerForecast = createAsyncThunk('forecasting/trigger', async (_, { rejectWithValue }) => {
  try {
    return (await forecastingService.triggerForecastGeneration()).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const forecastingSlice = createSlice({
  name: 'forecasting',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForecasts.pending, (state) => { state.loading = true })
      .addCase(fetchForecasts.fulfilled, (state, action) => {
        state.loading = false
        state.forecasts = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchForecasts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchForecastById.fulfilled, (state, action) => {
        state.currentForecast = action.payload
      })
      .addCase(triggerForecast.pending, (state) => { state.loading = true })
      .addCase(triggerForecast.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(triggerForecast.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = forecastingSlice.actions
export default forecastingSlice.reducer
