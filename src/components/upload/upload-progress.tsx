'use client'

import React from 'react'
import { FileAudio, X } from 'lucide-react'
import { formatFileSize } from '@/lib/job-utils'

interface UploadProgressProps {
  filename: string
  progress: number
  total: number
  onCancel?: () => void
  error?: string
}

export function UploadProgress({
  filename,
  progress,
  total,
  onCancel,
  error
}: UploadProgressProps) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0

  return (
    <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <FileAudio className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {filename}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(progress)} / {formatFileSize(total)}
            </div>
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Cancel upload"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <div className="text-sm text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {percentage}% uploaded
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {percentage === 100 ? 'Processing...' : 'Uploading...'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
            <div
              className="progress-bar h-2"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}