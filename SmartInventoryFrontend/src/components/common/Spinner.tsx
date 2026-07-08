import React from 'react'
import { Loader } from 'lucide-react'
import cn from 'classnames'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, text }) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56,
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader size={sizeMap[size]} className="animate-spin text-primary-600" />
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  )
}
