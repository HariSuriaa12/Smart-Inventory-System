import { useState, useCallback, useEffect } from 'react'

export interface UseFormProps<T> {
  initialValues: T
  onSubmit: (values: T) => void | Promise<void>
  validate?: (values: T) => Record<string, string>
}

export interface UseFormReturn<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isDirty: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void
  setFieldValue: (field: string, value: any) => void
  setFieldError: (field: string, error: string) => void
  resetForm: () => void
  setValues: (values: T) => void
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormProps<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialValuesRef] = useState(initialValues)

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef)

  const validateForm = useCallback((valuesToValidate: T): Record<string, string> => {
    if (!validate) return {}
    return validate(valuesToValidate)
  }, [validate])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setValues((prev) => ({ ...prev, [name]: fieldValue }))
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    const newErrors = validateForm({ ...values })
    setErrors(newErrors)
  }, [values, validateForm])

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault()

      const newErrors = validateForm(values)
      setErrors(newErrors)

      if (Object.keys(newErrors).length === 0) {
        setIsSubmitting(true)
        try {
          await onSubmit(values)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [values, validateForm, onSubmit]
  )

  const resetForm = useCallback(() => {
    setValues(initialValuesRef)
    setErrors({})
    setTouched({})
  }, [initialValuesRef])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    setValues,
  }
}
