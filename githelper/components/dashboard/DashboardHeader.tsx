'use client'

import React from 'react'
import { Menu, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DashboardHeaderProps {
  title?: string
  onMenuClick?: () => void
  onSearchClick?: () => void
  onNotificationsClick?: () => void
}

export function DashboardHeader({ 
  title, 
  onMenuClick, 
  onSearchClick, 
  onNotificationsClick 
}: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {title && (
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          )}
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-full"
              data-search-input
              onClick={onSearchClick}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onNotificationsClick}>
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}