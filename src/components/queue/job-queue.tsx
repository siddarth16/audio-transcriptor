'use client'

import React from 'react'
import { Trash2, RotateCcw, Eye } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { JobCard } from './job-card'

interface JobQueueProps {
  compact?: boolean
}

export function JobQueue({ compact = false }: JobQueueProps) {
  const { jobs, removeJob, clearJobs, setActiveJob, setCurrentView } = useAppStore()
  const { toast } = useToast()

  const handleViewResult = (jobId: string) => {
    setActiveJob(jobId)
    setCurrentView('transcribe')
  }

  const handleRemoveJob = (jobId: string) => {
    removeJob(jobId)
    toast.info('Job removed', 'Transcription job has been removed from queue')
  }

  const handleClearAll = () => {
    const completedJobs = jobs.filter(job => job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')
    
    if (completedJobs.length === 0) {
      toast.info('No jobs to clear', 'All jobs are currently processing')
      return
    }

    clearJobs()
    toast.success('Queue cleared', `Removed ${completedJobs.length} completed jobs`)
  }

  if (jobs.length === 0) {
    return (
      <div className={`${compact ? 'card p-4' : 'max-w-4xl mx-auto'}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No transcription jobs
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {compact 
              ? 'Upload or record audio to get started' 
              : 'Start by recording audio or uploading files to begin transcription'}
          </p>
        </div>
      </div>
    )
  }

  const processingJobs = jobs.filter(job => job.status === 'queued' || job.status === 'processing')
  const completedJobs = jobs.filter(job => job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')

  return (
    <div className={compact ? 'space-y-4' : 'max-w-4xl mx-auto space-y-6'}>
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Transcription Queue
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your audio transcription jobs
            </p>
          </div>
          
          {jobs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="btn btn-outline btn-md"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Completed
            </button>
          )}
        </div>
      )}

      {compact && jobs.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Jobs ({jobs.length})
          </h3>
          <button
            onClick={() => setCurrentView('queue')}
            className="btn btn-ghost btn-sm"
          >
            View All
          </button>
        </div>
      )}

      {/* Processing Jobs */}
      {processingJobs.length > 0 && (
        <div className="space-y-4">
          {!compact && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Processing ({processingJobs.length})
            </h2>
          )}
          
          {processingJobs.slice(0, compact ? 3 : undefined).map(job => (
            <JobCard
              key={job.id}
              job={job}
              onView={() => handleViewResult(job.id)}
              onRemove={() => handleRemoveJob(job.id)}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div className="space-y-4">
          {!compact && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Completed ({completedJobs.length})
            </h2>
          )}
          
          {completedJobs.slice(0, compact ? 3 : undefined).map(job => (
            <JobCard
              key={job.id}
              job={job}
              onView={() => handleViewResult(job.id)}
              onRemove={() => handleRemoveJob(job.id)}
              compact={compact}
            />
          ))}
        </div>
      )}

      {compact && jobs.length > 6 && (
        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentView('queue')}
            className="btn btn-outline btn-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All {jobs.length} Jobs
          </button>
        </div>
      )}
    </div>
  )
}