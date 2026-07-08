import { INPUT_VALIDATION } from './constants'

export const validateEmail = (email: string): boolean => {
  return INPUT_VALIDATION.EMAIL_REGEX.test(email)
}

export const validatePhone = (phone: string): boolean => {
  return INPUT_VALIDATION.PHONE_REGEX.test(phone)
}

export const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required'
  if (username.length < INPUT_VALIDATION.MIN_USERNAME_LENGTH) {
    return `Username must be at least ${INPUT_VALIDATION.MIN_USERNAME_LENGTH} characters`
  }
  if (username.length > INPUT_VALIDATION.MAX_USERNAME_LENGTH) {
    return `Username must not exceed ${INPUT_VALIDATION.MAX_USERNAME_LENGTH} characters`
  }
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < INPUT_VALIDATION.MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${INPUT_VALIDATION.MIN_PASSWORD_LENGTH} characters`
  }
  return null
}

export const validateEmail2 = (email: string): string | null => {
  if (!email) return 'Email is required'
  if (!validateEmail(email)) return 'Invalid email format'
  return null
}

export const validateRequired = (value: any, fieldName = 'This field'): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

export const validateMinLength = (value: string, min: number, fieldName = 'This field'): string | null => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`
  }
  return null
}

export const validateMaxLength = (value: string, max: number, fieldName = 'This field'): string | null => {
  if (value && value.length > max) {
    return `${fieldName} must not exceed ${max} characters`
  }
  return null
}

export const validateNumber = (value: any): string | null => {
  if (value === '' || value === null || value === undefined) return null
  if (isNaN(Number(value))) return 'Must be a valid number'
  return null
}

export const validatePositiveNumber = (value: any, fieldName = 'This field'): string | null => {
  const numberError = validateNumber(value)
  if (numberError) return numberError
  if (Number(value) <= 0) return `${fieldName} must be greater than 0`
  return null
}

export const validateMinValue = (value: number, min: number, fieldName = 'This field'): string | null => {
  if (value < min) {
    return `${fieldName} must be at least ${min}`
  }
  return null
}

export const validateMaxValue = (value: number, max: number, fieldName = 'This field'): string | null => {
  if (value > max) {
    return `${fieldName} must not exceed ${max}`
  }
  return null
}

export const validateDate = (date: string): string | null => {
  if (!date) return 'Date is required'
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return 'Invalid date format'
  return null
}

export const validateUrl = (url: string): string | null => {
  try {
    new URL(url)
    return null
  } catch {
    return 'Invalid URL format'
  }
}

export const validateFileSize = (fileSize: number, maxSize: number, fieldName = 'File'): string | null => {
  if (fileSize > maxSize) {
    return `${fieldName} size must not exceed ${maxSize / (1024 * 1024)}MB`
  }
  return null
}

export const validateFileType = (fileName: string, allowedTypes: string[]): string | null => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (!ext || !allowedTypes.includes(ext)) {
    return `Only ${allowedTypes.join(', ')} files are allowed`
  }
  return null
}
