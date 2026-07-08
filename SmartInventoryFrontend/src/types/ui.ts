import { Notification, NotificationType } from './common'

export interface Modal {
  [key: string]: boolean
}

export interface UIState {
  isLoading: boolean
  notifications: Notification[]
  modals: Modal
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  confirmDialog: {
    isOpen: boolean
    title: string
    message: string
    onConfirm: (() => void) | null
    onCancel: (() => void) | null
  }
}

export interface AddNotificationPayload {
  type: NotificationType
  message: string
  duration?: number
}

export interface OpenModalPayload {
  modalId: string
}

export interface CloseModalPayload {
  modalId: string
}

export interface ConfirmDialogPayload {
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
}
