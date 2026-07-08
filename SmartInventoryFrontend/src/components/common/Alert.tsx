import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import cn from 'classnames'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  children: React.ReactNode
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, dismissible = false, onDismiss, children, className, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(true)

  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <div className={cn('border rounded-lg p-4 flex gap-3', variantStyles[variant], className)} {...props}>
      {iconMap[variant]}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm">{children}</p>
      </div>
      {dismissible && (
        <button onClick={handleDismiss} className="flex-shrink-0 opacity-70 hover:opacity-100">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
