import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@/services/authService'
import { LoginRequest, AuthResponse, AuthState } from '@/types/auth'

const initialState: AuthState = {
  isAuthenticated: !!authService.getToken(),
  user: authService.getUser(),
  token: authService.getToken(),
  loading: false,
  error: null,
}

console.log('Initial Auth State:', initialState)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      if (response.data) {
        authService.saveToken(response.data.token)
        authService.saveUser(response.data.user)
        return response.data
      }
      return rejectWithValue(response.message || 'Login failed')
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout()
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      authService.saveUser(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
