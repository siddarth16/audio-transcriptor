'use client'

import React from 'react'
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react'
// import { clsx } from 'clsx'

interface RecordingControlsProps {
  isRecording: boolean
  isPaused: boolean
  hasRecording: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onClear: () => void
}

export function RecordingControls({
  isRecording,
  isPaused,
  hasRecording,
  onStart,
  onPause,
  onResume,
  onStop,
  onClear
}: RecordingControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      {!isRecording ? (
        <button
          onClick={onStart}
          className="btn btn-primary btn-lg rounded-full w-16 h-16 p-0"
          aria-label="Start recording"
        >
          <Mic className="h-6 w-6" />
        </button>
      ) : (
        <div className="flex items-center space-x-3">
          {isPaused ? (
            <button
              onClick={onResume}
              className="btn btn-primary btn-md rounded-full w-12 h-12 p-0"
              aria-label="Resume recording"
            >
              <Play className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={onPause}
              className="btn btn-secondary btn-md rounded-full w-12 h-12 p-0"
              aria-label="Pause recording"
            >
              <Pause className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={onStop}
            className="btn btn-outline btn-md rounded-full w-12 h-12 p-0 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            aria-label="Stop recording"
          >
            <Square className="h-5 w-5" />
          </button>
        </div>
      )}

      {hasRecording && !isRecording && (
        <button
          onClick={onClear}
          className="btn btn-ghost btn-md rounded-full w-10 h-10 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          aria-label="Clear recording"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}