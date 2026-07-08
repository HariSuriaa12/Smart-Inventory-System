import { format, parseISO, isValid } from 'date-fns'

export const formatDate = (date: string | Date | undefined, formatStr = 'MMM dd, yyyy'): string => {
  if (!date) return '-'
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return isValid(parsedDate) ? format(parsedDate, formatStr) : '-'
  } catch {
    return '-'
  }
}

export const formatDateTime = (date: string | Date | undefined): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm')
}

export const formatTime = (time: string | undefined): string => {
  if (!time) return '-'
  try {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  } catch {
    return time
  }
}

export const formatCurrency = (amount: number | undefined, currency = 'USD'): string => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatNumber = (num: number | undefined, decimals = 2): string => {
  if (num === undefined || num === null) return '-'
  return parseFloat(num.toString()).toFixed(decimals)
}

export const formatPercent = (value: number | undefined, decimals = 2): string => {
  if (value === undefined || value === null) return '-'
  return `${parseFloat(value.toString()).toFixed(decimals)}%`
}

export const formatQuantity = (qty: number | undefined): string => {
  if (qty === undefined || qty === null) return '-'
  return Math.round(qty).toString()
}

export const truncateString = (str: string | undefined, length = 50): string => {
  if (!str) return '-'
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export const formatStatus = (status: number | string | undefined): string => {
  if (!status && status !== 0) return '-'
  const statusMap: Record<string | number, string> = {
    0: 'Pending',
    1: 'Processing',
    2: 'Active',
    3: 'Completed',
    4: 'Cancelled',
    5: 'Failed',
  }
  return statusMap[status] || status.toString()
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
