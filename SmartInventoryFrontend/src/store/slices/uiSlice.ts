import { createSlice, nanoid } from '@reduxjs/toolkit'
import { UIState, AddNotificationPayload, ConfirmDialogPayload } from '@/types/ui'

const initialState: UIState = {
  isLoading: false,
  notifications: [],
  modals: {},
  sidebarOpen: true,
  theme: 'light',
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (state, action: { payload: AddNotificationPayload }) => {
      const id = nanoid()
      const notification = {
        id,
        ...action.payload,
      }
      state.notifications.push(notification)

      if (action.payload.duration !== 0) {
        setTimeout(() => {
          state.notifications = state.notifications.filter((n) => n.id !== id)
        }, action.payload.duration || 3000)
      }
    },
    removeNotification: (state, action: { payload: string }) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action: { payload: string }) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: { payload: string }) => {
      state.modals[action.payload] = false
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebar: (state, action: { payload: boolean }) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: { payload: 'light' | 'dark' }) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    showConfirmDialog: (state, action: { payload: ConfirmDialogPayload }) => {
      state.confirmDialog = {
        isOpen: true,
        ...action.payload,
      }
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog = {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      }
    },
  },
})

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebar,
  setTheme,
  showConfirmDialog,
  closeConfirmDialog,
} = uiSlice.actions

export default uiSlice.reducer
