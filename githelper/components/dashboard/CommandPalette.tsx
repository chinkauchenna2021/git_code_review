'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  GitBranch, 
  BarChart3, 
  Settings, 
  Users, 
  FileText,
  Command,
  ArrowRight
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface Command {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
  category: 'navigation' | 'actions' | 'search'
  shortcut?: string
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: Command[] = [
    {
      id: 'repositories',
      title: 'Go to Repositories',
      description: 'Manage your connected repositories',
      icon: GitBranch,
      action: () => router.push('/dashboard/repositories'),
      category: 'navigation',
      shortcut: 'G R'
    },
    {
      id: 'analytics',
      title: 'Go to Analytics',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      action: () => router.push('/dashboard/analytics'),
      category: 'navigation',
      shortcut: 'G A'
    },
    {
      id: 'settings',
      title: 'Go to Settings',
      description: 'Configure your account and preferences',
      icon: Settings,
      action: () => router.push('/dashboard/settings'),
      category: 'navigation',
      shortcut: 'G S'
    },
    {
      id: 'team',
      title: 'Go to Team',
      description: 'Manage team members and permissions',
      icon: Users,
      action: () => router.push('/dashboard/team'),
      category: 'navigation',
      shortcut: 'G T'
    },
    {
      id: 'new-review',
      title: 'Start New Review',
      description: 'Manually trigger a code review',
      icon: FileText,
      action: () => {
        // Handle new review action
        console.log('Starting new review')
      },
      category: 'actions'
    }
  ]

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredCommands, selectedIndex, onClose])

  const handleCommandClick = (command: Command) => {
    command.action()
    onClose()
  }

  return (
    <Modal 
      isOpen={open} 
      onClose={onClose} 
      title=""
      className="max-w-2xl"
    >
      <div className="p-0">
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search commands..."
            className="border-0 shadow-none focus:ring-0 text-lg"
            autoFocus
          />
          <Badge variant="secondary" className="ml-2 text-xs">
            <Command className="h-3 w-3 mr-1" />
            K
          </Badge>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No commands found for "{searchTerm}"
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <div
                  key={command.id}
                  onClick={() => handleCommandClick(command)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <command.icon className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{command.title}</p>
                    <p className="text-sm text-gray-500">{command.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {command.shortcut && (
                      <Badge variant="secondary" className="text-xs">
                        {command.shortcut}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-1 text-xs">↑↓</Badge>
              Navigate
            </div>
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-1 text-xs">↵</Badge>
              Execute
            </div>
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-1 text-xs">ESC</Badge>
              Close
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
