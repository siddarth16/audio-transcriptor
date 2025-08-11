'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileAudio, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { validateAudioFile } from '@/lib/validation'
import { generateTranscriptionJob } from '@/lib/job-utils'
import { FileUploader } from './file-uploader'
import { UploadProgress } from './upload-progress'

export function UploadInterface() {
  const { addJob, settings } = useAppStore()
  const { toast } = useToast()
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, { progress: number, total: number }>>(new Map())

  const handleFileUpload = useCallback(async (files: File[]) => {
    for (const file of files) {
      try {
        // Validate file
        const validation = validateAudioFile(file, {
          maxSize: settings.maxFileSize,
          allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/flac', 'audio/aac']
        })

        if (!validation.isValid) {
          toast.error('Invalid file', validation.error || 'File validation failed')
          continue
        }

        // Create job
        const job = generateTranscriptionJob(
          file,
          file.name,
          {
            language: settings.defaultLanguage,
            backend: settings.defaultBackend,
            enableTranslation: settings.enableTranslation,
            enableDiarization: settings.enableDiarization,
            enableWordTimestamps: settings.enableWordTimestamps,
          }
        )

        addJob(job)
        toast.success('File uploaded', `${file.name} has been queued for transcription`)
        
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Upload failed', `Could not upload ${file.name}`)
      }
    }
  }, [settings, addJob, toast])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac', '.aac', '.mp4']
    },
    maxSize: settings.maxFileSize,
    multiple: true,
  })

  const supportedFormats = [
    'MP3', 'WAV', 'M4A', 'WEBM', 'OGG', 'FLAC', 'AAC', 'MP4'
  ]

  const dropzoneClasses = `
    relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
    ${isDragActive 
      ? isDragAccept 
        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' 
        : 'border-red-400 bg-red-50 dark:bg-red-900/20'
      : 'border-gray-300 dark:border-dark-600 hover:border-primary-400 dark:hover:border-primary-600'
    }
  `

  return (
    <div className="card p-6 space-y-6">
      <div {...getRootProps()} className={dropzoneClasses}>
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragActive ? (
              <div className={`p-4 rounded-full ${isDragAccept ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <Upload className={`h-12 w-12 ${isDragAccept ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-dark-700 rounded-full">
                <FileAudio className="h-12 w-12 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isDragActive ? 
                (isDragAccept ? 'Drop files here' : 'File type not supported') :
                'Drop audio files here'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              or click to browse your computer
            </p>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div className="mb-2">
                <strong>Supported formats:</strong> {supportedFormats.join(', ')}
              </div>
              <div className="mb-2">
                <strong>Max file size:</strong> {Math.round(settings.maxFileSize / (1024 * 1024))}MB
              </div>
              <div>
                <strong>Max files:</strong> Unlimited
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Uploader Component */}
      <FileUploader
        onFilesSelected={handleFileUpload}
        maxFileSize={settings.maxFileSize}
        chunkSize={settings.chunkSize}
        supportedFormats={supportedFormats}
      />

      {/* Upload Progress */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Uploading Files
          </h4>
          {Array.from(uploadingFiles.entries()).map(([filename, progress]) => (
            <UploadProgress
              key={filename}
              filename={filename}
              progress={progress.progress}
              total={progress.total}
            />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              Tips for better transcription
            </h4>
            <ul className="text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
              <li>Use high-quality audio with minimal background noise</li>
              <li>Ensure clear speech with proper pronunciation</li>
              <li>For multiple speakers, enable speaker diarization in settings</li>
              <li>Longer files may take more time to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}