'use client'

import React, { useState, useCallback } from 'react'
import { Download, Upload } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { WaveformVisualizer } from './waveform-visualizer'
import { RecordingControls } from './recording-controls'
import { DeviceSelector } from './device-selector'
import { generateTranscriptionJob } from '@/lib/job-utils'

export function RecordingInterface() {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    waveformData,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    error: recordingError
  } = useAudioRecorder()

  const { addJob, settings } = useAppStore()
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording()
    } catch (error) {
      toast.error('Recording failed', 'Could not access microphone. Please check permissions.')
    }
  }, [startRecording, toast])

  const handleStopRecording = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  const handleSubmitRecording = useCallback(async () => {
    if (!audioBlob) return

    setIsSubmitting(true)
    try {
      const job = generateTranscriptionJob(
        audioBlob,
        'recorded-audio.wav',
        {
          language: settings.defaultLanguage,
          backend: settings.defaultBackend,
          enableTranslation: settings.enableTranslation,
          enableDiarization: settings.enableDiarization,
          enableWordTimestamps: settings.enableWordTimestamps,
        }
      )

      addJob(job)
      clearRecording()
      
      toast.success('Recording submitted', 'Your audio has been queued for transcription')
    } catch (error) {
      toast.error('Submission failed', 'Could not submit recording for transcription')
    } finally {
      setIsSubmitting(false)
    }
  }, [audioBlob, settings, addJob, clearRecording, toast])

  const handleDownloadRecording = useCallback(() => {
    if (!audioBlob) return

    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recording-${Date.now()}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [audioBlob])

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card p-6 space-y-6">
      <div className="space-y-4">
        <DeviceSelector />
        
        <WaveformVisualizer 
          waveformData={waveformData}
          isRecording={isRecording}
          duration={duration}
        />

        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-2">
            {formatDuration(duration)}
          </div>
          
          {recordingError && (
            <div className="text-sm text-red-600 dark:text-red-400 mb-4">
              {recordingError}
            </div>
          )}
        </div>

        <RecordingControls
          isRecording={isRecording}
          isPaused={isPaused}
          hasRecording={!!audioBlob}
          onStart={handleStartRecording}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={handleStopRecording}
          onClear={clearRecording}
        />

        {audioBlob && (
          <div className="border-t border-gray-200 dark:border-dark-600 pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadRecording}
                className="btn btn-outline btn-md flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
              
              <button
                onClick={handleSubmitRecording}
                disabled={isSubmitting}
                className="btn btn-primary btn-md flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Transcribe'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}