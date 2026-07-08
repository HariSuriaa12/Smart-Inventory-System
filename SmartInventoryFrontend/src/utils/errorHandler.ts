import axios from 'axios'

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data as any
      if (typeof data.message === 'string') return data.message
      if (typeof data.error === 'string') return data.error
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors[0]
      }
    }
    if (error.message) return error.message
    if (error.response?.status) {
      const statusMessages: Record<number, string> = {
        400: 'Bad request. Please check your input.',
        401: 'Unauthorized. Please log in again.',
        403: 'Forbidden. You do not have permission.',
        404: 'Not found.',
        409: 'Conflict. The resource already exists.',
        422: 'Validation error. Please check your input.',
        500: 'Server error. Please try again later.',
        503: 'Service unavailable. Please try again later.',
      }
      return statusMessages[error.response.status] || 'An error occurred'
    }
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

export const handleApiError = (error: unknown, defaultMessage = 'An error occurred'): string => {
  const message = getErrorMessage(error)
  return message || defaultMessage
}

export const isNetworkError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response && !error.status
  }
  return false
}

export const isServerError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status ? error.response.status >= 500 : false
  }
  return false
}

export const isClientError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status ? (error.response.status >= 400 && error.response.status < 500) : false
  }
  return false
}

export const isUnauthorized = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401
  }
  return false
}

export const isForbidden = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403
  }
  return false
}

export const isNotFound = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 404
  }
  return false
}
