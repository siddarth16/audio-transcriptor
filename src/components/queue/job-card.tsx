'use client'

import React from 'react'
import { FileAudio, Clock, User, Globe, Eye, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { TranscriptionJob } from '@/types'
import { formatFileSize, formatDuration, getJobStatusText, getJobStatusColor } from '@/lib/job-utils'
import { clsx } from 'clsx'

interface JobCardProps {
  job: TranscriptionJob
  onView?: () => void
  onRemove?: () => void
  compact?: boolean
}

export function JobCard({ job, onView, onRemove, compact = false }: JobCardProps) {
  const statusText = getJobStatusText(job.status)
  const statusColor = getJobStatusColor(job.status)
  const canView = job.status === 'completed' && job.result

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    if (diffMs < 60000) { // Less than 1 minute
      return 'Just now'
    } else if (diffMs < 3600000) { // Less than 1 hour
      return `${Math.floor(diffMs / 60000)}m ago`
    } else if (diffMs < 86400000) { // Less than 1 day
      return `${Math.floor(diffMs / 3600000)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={clsx(
            'p-2 rounded-lg',
            job.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
            job.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' :
            'bg-gray-100 dark:bg-dark-700'
          )}>
            <FileAudio className={clsx(
              'h-5 w-5',
              job.status === 'completed' ? 'text-green-600 dark:text-green-400' :
              job.status === 'failed' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            )} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {job.filename}
              </h3>
              
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatFileSize(job.fileSize)}</span>
                <span>{formatTime(job.createdAt)}</span>
                {job.result?.duration && (
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(job.result.duration)}</span>
                  </span>
                )}
              </div>

              {!compact && job.settings && (
                <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="capitalize">{job.settings.backend}</span>
                  <span className="capitalize">{job.settings.language === 'auto' ? 'Auto-detect' : job.settings.language}</span>
                  {job.settings.enableDiarization && (
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>Speakers</span>
                    </span>
                  )}
                  {job.settings.enableTranslation && (
                    <span className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>Translation</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <span className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                statusColor
              )}>
                {job.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {job.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                {statusText}
              </span>
            </div>
          </div>

          {/* Progress Bar for Processing Jobs */}
          {(job.status === 'processing' || job.status === 'queued') && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {job.status === 'queued' ? 'Waiting to start...' : `${job.progress}% complete`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                <div
                  className="progress-bar h-2"
                  style={{ 
                    width: `${job.status === 'queued' ? 0 : job.progress}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {job.status === 'failed' && job.error && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
              {job.error}
            </div>
          )}

          {/* Result Summary */}
          {job.status === 'completed' && job.result && !compact && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    {job.result.segments.length} segments
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Language: {job.result.language.toUpperCase()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Confidence: {Math.round(job.result.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              {job.result.text.length > 0 && (
                <div className="mt-2 text-gray-900 dark:text-gray-100">
                  <div className="line-clamp-2">
                    {job.result.text.slice(0, 150)}
                    {job.result.text.length > 150 && '...'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 mt-3">
            {canView && onView && (
              <button
                onClick={onView}
                className="btn btn-primary btn-sm"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Result
              </button>
            )}
            
            {onRemove && job.status !== 'processing' && (
              <button
                onClick={onRemove}
                className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}