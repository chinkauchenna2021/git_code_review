'use client'

import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

interface DateRangePickerProps {
  value?: { start: Date; end: Date } | null
  onChange?: (value: { start: Date; end: Date } | null) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Calendar className="h-4 w-4" />
        <span>
          {value 
            ? `${formatDate(value.start)} - ${formatDate(value.end)}`
            : 'Select date range'
          }
        </span>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={value?.start.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const newStart = new Date(e.target.value)
                  onChange?.({
                    start: newStart,
                    end: value?.end || new Date()
                  })
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={value?.end.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const newEnd = new Date(e.target.value)
                  onChange?.({
                    start: value?.start || new Date(),
                    end: newEnd
                  })
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
