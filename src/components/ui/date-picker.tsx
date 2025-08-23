'use client'

import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface CustomDatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder = 'gg/aa/yyyy',
  required = false,
  className = ''
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  )
  const [isOpen, setIsOpen] = useState(false)

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      // Format date as YYYY-MM-DD for form submission
      const formattedDate = format(date, 'yyyy-MM-dd')
      onChange(formattedDate)
    } else {
      onChange('')
    }
    setIsOpen(false)
  }

  const displayValue = selectedDate 
    ? format(selectedDate, 'dd/MM/yyyy', { locale: tr })
    : ''

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        <Input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          required={required}
          className="pr-10"
          onClick={() => setIsOpen(!isOpen)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 border-l-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Calendar className="w-4 h-4" />
        </Button>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            locale={tr}
            dateFormat="dd/MM/yyyy"
            inline
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={10}
            scrollableYearDropdown
          />
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}