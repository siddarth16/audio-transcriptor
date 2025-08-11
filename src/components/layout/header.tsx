'use client'

import React from 'react'
import { Mic, Moon, Sun, Github } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-16 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
          <Mic className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Audio Transcriptor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Professional speech-to-text processing
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <a
          href="https://github.com/audio-transcriptor"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          aria-label="View source on GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
        
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn btn-ghost btn-sm"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  )
}