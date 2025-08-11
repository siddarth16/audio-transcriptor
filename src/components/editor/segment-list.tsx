'use client'

import React, { useState } from 'react'
import { Play, Edit2, User } from 'lucide-react'
import { TranscriptionSegment } from '@/types'
// import { formatDuration } from '@/lib/job-utils'
import { clsx } from 'clsx'

interface SegmentListProps {
  segments: TranscriptionSegment[]
  currentTime: number
  onSeek: (time: number) => void
  onEdit: (segmentId: string, newText: string) => void
}

export function SegmentList({ segments, currentTime, onSeek, onEdit }: SegmentListProps) {
  const [editingSegment, setEditingSegment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const handleEditStart = (segment: TranscriptionSegment) => {
    setEditingSegment(segment.id)
    setEditText(segment.text)
  }

  const handleEditSave = (segmentId: string) => {
    onEdit(segmentId, editText)
    setEditingSegment(null)
    setEditText('')
  }

  const handleEditCancel = () => {
    setEditingSegment(null)
    setEditText('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3 max-h-96 overflow-auto scrollbar-thin">
      {segments.map((segment, index) => {
        const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime
        const isEditing = editingSegment === segment.id

        return (
          <div
            key={segment.id}
            className={clsx(
              'p-3 rounded-lg border transition-colors',
              isActive
                ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-dark-700 dark:border-dark-600 dark:hover:bg-dark-600'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onSeek(segment.startTime)}
                  className="btn btn-ghost btn-sm p-1"
                  title="Play from here"
                >
                  <Play className="h-3 w-3" />
                </button>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                </div>
                
                {segment.speaker && (
                  <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                    <User className="h-3 w-3" />
                    <span>{segment.speaker}</span>
                  </div>
                )}
                
                {segment.confidence && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {Math.round(segment.confidence * 100)}%
                  </div>
                )}
              </div>

              <button
                onClick={() => handleEditStart(segment)}
                className="btn btn-ghost btn-sm p-1"
                title="Edit segment"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none dark:bg-dark-800 dark:border-dark-600"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditSave(segment.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                {segment.text}
              </div>
            )}

            {/* Word-level timestamps if available */}
            {segment.words && segment.words.length > 0 && !isEditing && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Word-level timestamps ({segment.words.length} words)
                </summary>
                <div className="mt-2 p-2 bg-gray-100 dark:bg-dark-600 rounded text-xs space-y-1">
                  {segment.words.map((word, wordIndex) => (
                    <div key={wordIndex} className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-gray-100">
                        {word.word}
                      </span>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <span className="font-mono">
                          {formatTime(word.startTime)}-{formatTime(word.endTime)}
                        </span>
                        {word.confidence && (
                          <span>{Math.round(word.confidence * 100)}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )
      })}
    </div>
  )
}