import OpenAI from 'openai'
import { BaseTranscriptionService } from './base'
import { 
  TranscriptionResult, 
  TranscriptionSettings, 
  TranscriptionSegment,
  WordTimestamp 
} from '@/types'

export class WhisperTranscriptionService extends BaseTranscriptionService {
  id = 'whisper'
  name = 'OpenAI Whisper'
  description = 'High-quality transcription using OpenAI Whisper API'
  maxFileSize = 25 * 1024 * 1024 // 25MB limit for Whisper API
  maxDuration = 30 * 60 // 30 minutes
  supportedFormats = ['mp3', 'mp4', 'm4a', 'wav', 'webm', 'flac', 'ogg']
  features = {
    wordTimestamps: true,
    diarization: false,
    translation: true,
    languageDetection: true,
  }

  private client: OpenAI

  constructor() {
    super()
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async transcribe(
    audioFile: Blob,
    settings: TranscriptionSettings,
    onProgress?: (progress: number) => void
  ): Promise<TranscriptionResult> {
    this.validateFile(audioFile)
    
    const startTime = Date.now()
    onProgress?.(10)

    try {
      const file = new File([audioFile], 'audio.wav', { type: audioFile.type })
      
      onProgress?.(30)
      
      // Create transcription request
      const transcriptionParams: any = {
        file,
        model: 'whisper-1',
        response_format: 'verbose_json'
      }

      // Set language if not auto-detect
      if (settings.language && settings.language !== 'auto') {
        transcriptionParams.language = settings.language
      }

      onProgress?.(50)

      let response: any
      
      if (settings.enableTranslation && settings.language !== 'en') {
        response = await this.client.audio.translations.create({
          file,
          model: 'whisper-1',
          response_format: 'verbose_json'
        })
      } else {
        response = await this.client.audio.transcriptions.create(transcriptionParams)
      }

      onProgress?.(80)

      const segments: TranscriptionSegment[] = response.segments?.map((segment: any, index: number) => {
        const words: WordTimestamp[] = segment.words?.map((word: any) => ({
          word: word.word,
          startTime: word.start,
          endTime: word.end,
          confidence: 1.0 // Whisper doesn't provide word-level confidence
        })) || []

        return {
          id: `segment-${index}`,
          text: segment.text.trim(),
          startTime: segment.start,
          endTime: segment.end,
          confidence: 1.0, // Whisper doesn't provide segment confidence
          words: settings.enableWordTimestamps ? words : undefined
        }
      }) || []

      onProgress?.(100)

      const result: TranscriptionResult = {
        id: this.generateId(),
        text: response.text,
        segments,
        language: response.language || settings.language || 'en',
        confidence: 1.0,
        duration: response.duration || 0,
        metadata: {
          filename: 'audio.wav',
          fileSize: audioFile.size,
          processingTime: Date.now() - startTime,
          backend: this.id,
          features: [
            'transcription',
            ...(settings.enableWordTimestamps ? ['word-timestamps'] : []),
            ...(settings.enableTranslation ? ['translation'] : []),
          ]
        }
      }

      return result
    } catch (error) {
      console.error('Whisper transcription failed:', error)
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}