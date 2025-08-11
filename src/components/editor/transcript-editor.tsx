'use client'

import React, { useState } from 'react'
import { ArrowLeft, Download, Edit } from 'lucide-react'
import { TranscriptionJob } from '@/types'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { SegmentList } from './segment-list'
import { ExportOptions } from './export-options'
import { formatDuration } from '@/lib/job-utils'

interface TranscriptEditorProps {
  job: TranscriptionJob
}

export function TranscriptEditor({ job }: TranscriptEditorProps) {
  const { setActiveJob } = useAppStore()
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(0)
  const [showExportOptions, setShowExportOptions] = useState(false)

  const result = job.result
  if (!result) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No transcription result available.
        </p>
      </div>
    )
  }

  const handleBack = () => {
    setActiveJob(undefined)
  }

  const handleExport = (format: string) => {
    // This would be implemented with actual export logic
    toast.success('Export started', `Preparing ${format.toUpperCase()} export...`)
    setShowExportOptions(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="btn btn-ghost btn-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {job.filename}
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {result.segments.length} segments • {formatDuration(result.duration)} • {result.language.toUpperCase()}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowExportOptions(true)}
          className="btn btn-primary btn-md"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {result.segments.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Segments
          </div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatDuration(result.duration)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Duration
          </div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(result.confidence * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Confidence
          </div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
            {job.settings.backend}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Backend
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Full Transcript */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Full Transcript
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 max-h-96 overflow-auto scrollbar-thin">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                {result.text}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {result.text.split(' ').length} words
            </div>
            <button className="btn btn-outline btn-sm">
              <Edit className="h-3 w-3 mr-1" />
              Edit Text
            </button>
          </div>
        </div>

        {/* Segment List */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Segments
          </h2>
          
          <SegmentList
            segments={result.segments}
            currentTime={currentTime}
            onSeek={(time) => setCurrentTime(time)}
            onEdit={(_segmentId, _newText) => {
              // Implement segment editing
              toast.info('Edit saved', 'Segment text has been updated')
            }}
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExportOptions && (
        <ExportOptions
          job={job}
          onExport={handleExport}
          onClose={() => setShowExportOptions(false)}
        />
      )}
    </div>
  )
}