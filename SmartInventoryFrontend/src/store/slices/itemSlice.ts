import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { itemService } from '@/services/itemService'
import { Item, CreateItemRequest, UpdateItemRequest, ItemState } from '@/types/item'

const initialState: ItemState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  total: 0,
  skip: 0,
  take: 10,
  searchQuery: null,
}

export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async ({ skip = 0, take = 10, searchQuery }: { skip?: number; take?: number; searchQuery?: string }, { rejectWithValue }) => {
    try {
      const response = await itemService.getItems(skip, take, searchQuery)
      return { ...response.data, searchQuery }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchItemsByCategory = createAsyncThunk(
  'items/fetchItemsByCategory',
  async ({ category, skip = 0, take = 10 }: { category: string; skip?: number; take?: number }, { rejectWithValue }) => {
    try {
      const response = await itemService.getByCategory(category)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchItemById = createAsyncThunk(
  'items/fetchItemById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await itemService.getItemById(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createItem = createAsyncThunk(
  'items/createItem',
  async (data: CreateItemRequest, { rejectWithValue }) => {
    try {
      const response = await itemService.createItem(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateItem = createAsyncThunk(
  'items/updateItem',
  async ({ id, data }: { id: number; data: UpdateItemRequest }, { rejectWithValue }) => {
    try {
      const response = await itemService.updateItem(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (id: number, { rejectWithValue }) => {
    try {
      await itemService.deleteItem(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload
    },
    clearCurrentItem: (state) => {
      state.currentItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || []
        state.total = action.payload.total || 0
        state.skip = action.payload.skip || 0
        state.take = action.payload.take || 10
        state.searchQuery = action.payload.searchQuery || null
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchItemById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        state.loading = false
        state.currentItem = action.payload
      })
      .addCase(fetchItemById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
        state.total += 1
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.currentItem = action.payload
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.total -= 1
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null
        }
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchItemsByCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItemsByCategory.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || []
        state.total = action.payload.total || 0
        state.skip = action.payload.skip || 0
        state.take = action.payload.take || 10
      })
      .addCase(fetchItemsByCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentItem, clearCurrentItem } = itemSlice.actions
export default itemSlice.reducer
