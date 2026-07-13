import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingEnd, setSelectingEnd] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = selectedDate.toISOString().split('T')[0]

    if (!selectingEnd) {
      onStartDateChange(dateString)
      setSelectingEnd(true)
    } else {
      if (dateString < startDate) {
        onStartDateChange(dateString)
        onEndDateChange(startDate)
      } else {
        onEndDateChange(dateString)
      }
      setSelectingEnd(false)
      setIsOpen(false)
    }
  }

  const isDateInRange = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]

    if (!startDate || !endDate) return false
    return dateString >= startDate && dateString <= endDate
  }

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]
    return dateString === startDate || dateString === endDate
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={startDate || ''}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder="Start Date"
          onClick={() => setIsOpen(true)}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm cursor-pointer"
          readOnly
        />
        <span className="text-gray-400">→</span>
        <input
          type="text"
          value={endDate || ''}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder="End Date"
          onClick={() => setIsOpen(true)}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm cursor-pointer"
          readOnly
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-gray-900">{monthName}</span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-500">
                {day}
              </div>
            ))}

            {renderCalendar().map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateClick(day)}
                disabled={!day}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-colors ${
                  !day
                    ? 'cursor-default'
                    : isDateSelected(day)
                    ? 'bg-primary-600 text-white font-semibold'
                    : isDateInRange(day)
                    ? 'bg-primary-100 text-primary-900'
                    : 'hover:bg-gray-100 cursor-pointer'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-end border-t pt-4">
            <button
              onClick={() => {
                setIsOpen(false)
                setSelectingEnd(false)
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Done
            </button>
            <button
              onClick={() => {
                onStartDateChange('')
                onEndDateChange('')
                setSelectingEnd(false)
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
            {selectingEnd ? 'Select end date' : 'Select start date'}
          </div>
        </div>
      )}
    </div>
  )
}
