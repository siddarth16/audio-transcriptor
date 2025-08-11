'use client'

import React from 'react'
import { Header } from './header'
import { Navigation } from './navigation'
import { Settings } from '../settings/settings'
import { useAppStore } from '@/lib/store'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentView } = useAppStore()

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-900">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Navigation />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'settings' ? (
            <Settings />
          ) : (
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}