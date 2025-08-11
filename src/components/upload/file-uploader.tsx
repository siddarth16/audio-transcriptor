'use client'

import React, { useRef } from 'react'
import { FolderOpen } from 'lucide-react'

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  maxFileSize: number
  chunkSize: number
  supportedFormats: string[]
  className?: string
}

export function FileUploader({
  onFilesSelected,
  maxFileSize,
  supportedFormats,
  className = ''
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const acceptedTypes = [
    'audio/mpeg',
    'audio/wav', 
    'audio/m4a',
    'audio/webm',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/mp4'
  ].join(',')

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={handleBrowseClick}
        className="btn btn-outline btn-md w-full"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Browse Files
      </button>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <div>Select multiple files by holding Ctrl/Cmd while clicking</div>
      </div>
    </div>
  )
}