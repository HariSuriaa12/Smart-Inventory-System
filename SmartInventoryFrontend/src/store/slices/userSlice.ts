import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@/services/authService'
import { User, CreateUserRequest, UpdateUserRequest, UserState } from '@/types/user'

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
}

export const fetchUsers = createAsyncThunk('users/fetch', async ({ skip = 0, take = 10 }: any, { rejectWithValue }) => {
  try {
    return (await authService.getUsers(skip, take)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const createUser = createAsyncThunk('users/create', async (data: CreateUserRequest, { rejectWithValue }) => {
  try {
    return (await authService.createUser(data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const updateUser = createAsyncThunk('users/update', async ({ id, data }: any, { rejectWithValue }) => {
  try {
    return (await authService.updateUser(id, data)).data
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const deleteUser = createAsyncThunk('users/delete', async (id: number, { rejectWithValue }) => {
  try {
    await authService.deleteUser(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload?.data || []
        state.total = action.payload?.total || 0
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id)
        if (idx !== -1) state.users[idx] = action.payload
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload)
      })
  },
})

export const { clearError } = userSlice.actions
export default userSlice.reducer
