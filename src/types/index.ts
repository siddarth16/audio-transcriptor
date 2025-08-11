export interface TranscriptionSegment {
  id: string
  text: string
  startTime: number
  endTime: number
  confidence?: number
  speaker?: string
  words?: WordTimestamp[]
}

export interface WordTimestamp {
  word: string
  startTime: number
  endTime: number
  confidence?: number
}

export interface TranscriptionResult {
  id: string
  text: string
  segments: TranscriptionSegment[]
  language: string
  confidence: number
  duration: number
  metadata: {
    filename: string
    fileSize: number
    processingTime: number
    backend: string
    features: string[]
  }
}

export interface TranscriptionJob {
  id: string
  filename: string
  fileSize: number
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  result?: TranscriptionResult
  error?: string
  createdAt: number
  updatedAt: number
  settings: TranscriptionSettings
}

export interface TranscriptionSettings {
  language: string
  backend: string
  enableTranslation: boolean
  enableDiarization: boolean
  enableWordTimestamps: boolean
}

export interface TranscriptionBackend {
  id: string
  name: string
  description: string
  maxFileSize: number
  maxDuration: number
  supportedFormats: string[]
  features: {
    wordTimestamps: boolean
    diarization: boolean
    translation: boolean
    languageDetection: boolean
  }
  transcribe(
    audioFile: Blob,
    settings: TranscriptionSettings,
    onProgress?: (progress: number) => void
  ): Promise<TranscriptionResult>
}

export interface AudioRecording {
  blob: Blob
  duration: number
  waveformData?: number[]
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ChunkUploadState {
  chunkIndex: number
  totalChunks: number
  uploadId: string
  completed: boolean[]
}

export interface AppSettings {
  theme: 'light' | 'dark'
  defaultBackend: string
  defaultLanguage: string
  enableTranslation: boolean
  enableDiarization: boolean
  enableWordTimestamps: boolean
  maxFileSize: number
  chunkSize: number
}

export interface FeatureFlags {
  enableWhisperBackend: boolean
  enableAssemblyAIBackend: boolean
  enableDiarization: boolean
  enableTranslation: boolean
  enableWordTimestamps: boolean
}

export type ExportFormat = 'txt' | 'srt' | 'vtt' | 'json'

export interface ExportOptions {
  format: ExportFormat
  includeTimestamps: boolean
  includeSpeakers: boolean
  includeConfidence: boolean
}