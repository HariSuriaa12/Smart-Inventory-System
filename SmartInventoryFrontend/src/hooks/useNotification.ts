import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks/useAppDispatch'
import { addNotification } from '@/store/slices/uiSlice'
import { NotificationType } from '@/types/common'
import { NOTIFICATION_DURATION } from '@/utils/constants'

export const useNotification = () => {
  const dispatch = useAppDispatch()

  const notify = useCallback(
    (message: string, type: NotificationType = NotificationType.Info, duration: number = NOTIFICATION_DURATION.NORMAL) => {
      dispatch(
        addNotification({
          type,
          message,
          duration,
        })
      )
    },
    [dispatch]
  )

  const success = useCallback((message: string, duration?: number) => {
    notify(message, NotificationType.Success, duration)
  }, [notify])

  const error = useCallback((message: string, duration?: number) => {
    notify(message, NotificationType.Error, duration || NOTIFICATION_DURATION.LONG)
  }, [notify])

  const warning = useCallback((message: string, duration?: number) => {
    notify(message, NotificationType.Warning, duration)
  }, [notify])

  const info = useCallback((message: string, duration?: number) => {
    notify(message, NotificationType.Info, duration)
  }, [notify])

  return {
    notify,
    success,
    error,
    warning,
    info,
  }
}
