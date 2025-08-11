'use client'

import React from 'react'
import { FileAudio, List, Settings } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { clsx } from 'clsx'

const navigationItems = [
  {
    id: 'transcribe' as const,
    label: 'Transcribe',
    icon: FileAudio,
    description: 'Record or upload audio files'
  },
  {
    id: 'queue' as const,
    label: 'Queue',
    icon: List,
    description: 'Manage transcription jobs'
  },
  {
    id: 'settings' as const,
    label: 'Settings',
    icon: Settings,
    description: 'Configure app preferences'
  }
]

export function Navigation() {
  const { currentView, setCurrentView } = useAppStore()

  return (
    <nav className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 overflow-auto">
      <div className="p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={clsx(
                  'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-dark-700'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={clsx(
                  'h-5 w-5 flex-shrink-0',
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}