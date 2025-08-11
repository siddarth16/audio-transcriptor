import { TranscriptionBackend, TranscriptionResult, TranscriptionSettings } from '@/types'

export abstract class BaseTranscriptionService implements TranscriptionBackend {
  abstract id: string
  abstract name: string
  abstract description: string
  abstract maxFileSize: number
  abstract maxDuration: number
  abstract supportedFormats: string[]
  abstract features: {
    wordTimestamps: boolean
    diarization: boolean
    translation: boolean
    languageDetection: boolean
  }

  abstract transcribe(
    audioFile: Blob,
    settings: TranscriptionSettings,
    onProgress?: (progress: number) => void
  ): Promise<TranscriptionResult>

  protected validateFile(audioFile: Blob): void {
    if (audioFile.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`)
    }

    const fileType = audioFile.type.toLowerCase()
    const isSupported = this.supportedFormats.some(format => 
      fileType.includes(format.toLowerCase())
    )

    if (!isSupported) {
      throw new Error(`File type ${fileType} is not supported. Supported formats: ${this.supportedFormats.join(', ')}`)
    }
  }

  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected exponentialBackoff(attempt: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000)
  }
}