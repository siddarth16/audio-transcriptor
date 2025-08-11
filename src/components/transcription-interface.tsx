'use client'

import React from 'react'
import { useAppStore } from '@/lib/store'
import { RecordingInterface } from './recording/recording-interface'
import { UploadInterface } from './upload/upload-interface'
import { JobQueue } from './queue/job-queue'
import { TranscriptEditor } from './editor/transcript-editor'

export function TranscriptionInterface() {
  const { currentView, activeJobId, jobs } = useAppStore()
  const activeJob = activeJobId ? jobs.find(job => job.id === activeJobId) : undefined

  if (currentView === 'queue') {
    return <JobQueue />
  }

  if (activeJob?.result) {
    return <TranscriptEditor job={activeJob} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Audio Transcription
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Record audio directly or upload files for professional speech-to-text processing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Record Audio
          </h2>
          <RecordingInterface />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Upload Files
          </h2>
          <UploadInterface />
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="mt-8">
          <JobQueue compact />
        </div>
      )}
    </div>
  )
}