import { v4 as uuidv4 } from 'uuid'
import { TranscriptionJob, TranscriptionSettings } from '@/types'
import { sanitizeFilename } from './validation'

export function generateTranscriptionJob(
  audioFile: Blob | File,
  filename: string,
  settings: TranscriptionSettings
): TranscriptionJob {
  const sanitizedFilename = sanitizeFilename(filename)
  
  return {
    id: uuidv4(),
    filename: sanitizedFilename,
    fileSize: audioFile.size,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: { ...settings }
  }
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
}

export function getJobStatusText(status: TranscriptionJob['status']): string {
  switch (status) {
    case 'queued':
      return 'Queued'
    case 'processing':
      return 'Processing'
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}

export function getJobStatusColor(status: TranscriptionJob['status']): string {
  switch (status) {
    case 'queued':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
    case 'processing':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
    case 'completed':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
    case 'failed':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    case 'cancelled':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
  }
}

export function calculateETA(progress: number, startTime: number): string {
  if (progress <= 0) return 'Calculating...'
  
  const elapsed = Date.now() - startTime
  const rate = progress / elapsed
  const remaining = (1 - progress) / rate
  
  if (remaining < 60000) { // Less than 1 minute
    return `${Math.round(remaining / 1000)}s remaining`
  }
  
  if (remaining < 3600000) { // Less than 1 hour
    return `${Math.round(remaining / 60000)}m remaining`
  }
  
  return `${Math.round(remaining / 3600000)}h remaining`
}

export function generateJobId(): string {
  return uuidv4()
}

export function isJobProcessing(job: TranscriptionJob): boolean {
  return job.status === 'processing' || job.status === 'queued'
}

export function isJobCompleted(job: TranscriptionJob): boolean {
  return job.status === 'completed'
}

export function isJobFailed(job: TranscriptionJob): boolean {
  return job.status === 'failed'
}