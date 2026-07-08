import { useState, useCallback } from 'react'
import { PAGINATION_DEFAULTS } from '@/utils/constants'

export interface UsePaginationProps {
  initialSkip?: number
  initialTake?: number
}

export const usePagination = ({ initialSkip = PAGINATION_DEFAULTS.SKIP, initialTake = PAGINATION_DEFAULTS.TAKE }: UsePaginationProps = {}) => {
  const [skip, setSkip] = useState(initialSkip)
  const [take, setTake] = useState(initialTake)
  const [total, setTotal] = useState(0)

  const currentPage = Math.floor(skip / take) + 1
  const totalPages = Math.ceil(total / take)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const goToPage = useCallback((page: number) => {
    const newSkip = (page - 1) * take
    setSkip(Math.max(0, newSkip))
  }, [take])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setSkip((prev) => prev + take)
    }
  }, [hasNextPage, take])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setSkip((prev) => Math.max(0, prev - take))
    }
  }, [hasPreviousPage, take])

  const changePageSize = useCallback((newTake: number) => {
    setTake(newTake)
    setSkip(0)
  }, [])

  const reset = useCallback(() => {
    setSkip(initialSkip)
    setTake(initialTake)
  }, [initialSkip, initialTake])

  return {
    skip,
    take,
    total,
    setTotal,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    reset,
  }
}
