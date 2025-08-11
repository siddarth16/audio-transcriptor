import { AssemblyAI } from 'assemblyai'
import { BaseTranscriptionService } from './base'
import { 
  TranscriptionResult, 
  TranscriptionSettings, 
  TranscriptionSegment,
  WordTimestamp 
} from '@/types'

export class AssemblyAITranscriptionService extends BaseTranscriptionService {
  id = 'assemblyai'
  name = 'AssemblyAI'
  description = 'Advanced AI transcription with speaker diarization and analysis'
  maxFileSize = 100 * 1024 * 1024 // 100MB
  maxDuration = 4 * 60 * 60 // 4 hours
  supportedFormats = ['mp3', 'mp4', 'm4a', 'wav', 'webm', 'flac', 'aac']
  features = {
    wordTimestamps: true,
    diarization: true,
    translation: false,
    languageDetection: true,
  }

  private client: AssemblyAI

  constructor() {
    super()
    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error('AssemblyAI API key not configured')
    }
    this.client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY
    })
  }

  async transcribe(
    audioFile: Blob,
    settings: TranscriptionSettings,
    onProgress?: (progress: number) => void
  ): Promise<TranscriptionResult> {
    this.validateFile(audioFile)
    
    const startTime = Date.now()
    onProgress?.(5)

    try {
      // Upload audio file
      const uploadResponse = await this.client.files.upload(audioFile)
      onProgress?.(20)

      // Configure transcription parameters
      const params: any = {
        audio_url: uploadResponse.upload_url,
        language_detection: settings.language === 'auto',
        word_boost: [],
        boost_param: 'low'
      }

      // Set specific language if not auto-detect
      if (settings.language && settings.language !== 'auto') {
        params.language_code = this.mapLanguageCode(settings.language)
      }

      // Enable speaker diarization if requested
      if (settings.enableDiarization && this.features.diarization) {
        params.speaker_labels = true
      }

      onProgress?.(30)

      // Submit transcription request
      const transcript = await this.client.transcripts.submit(params)
      onProgress?.(40)

      // Poll for completion
      let result = await this.client.transcripts.get(transcript.id)
      let attempts = 0
      const maxAttempts = 120 // 10 minutes max wait time

      while (result.status === 'queued' || result.status === 'processing') {
        if (attempts >= maxAttempts) {
          throw new Error('Transcription timed out')
        }

        await this.sleep(5000) // Wait 5 seconds
        result = await this.client.transcripts.get(transcript.id)
        attempts++

        // Update progress based on status
        if (result.status === 'processing') {
          const progressPercent = Math.min(40 + (attempts / maxAttempts) * 50, 90)
          onProgress?.(progressPercent)
        }
      }

      if (result.status === 'error') {
        throw new Error(result.error || 'Transcription failed')
      }

      onProgress?.(95)

      // Convert to our format
      const segments: TranscriptionSegment[] = result.words?.map((word: any, index: number) => {
        // Group words into segments by speaker or time gaps
        return {
          id: `word-${index}`,
          text: word.text,
          startTime: word.start / 1000, // Convert ms to seconds
          endTime: word.end / 1000,
          confidence: word.confidence || 0,
          speaker: word.speaker ? `Speaker ${word.speaker}` : undefined,
          words: [{
            word: word.text,
            startTime: word.start / 1000,
            endTime: word.end / 1000,
            confidence: word.confidence || 0
          }]
        }
      }) || []

      // Group consecutive words by speaker into proper segments
      const groupedSegments = this.groupWordsIntoSegments(segments)

      onProgress?.(100)

      const transcriptionResult: TranscriptionResult = {
        id: this.generateId(),
        text: result.text || '',
        segments: groupedSegments,
        language: result.language_code || settings.language || 'en',
        confidence: result.confidence || 0,
        duration: (result.audio_duration || 0) / 1000, // Convert ms to seconds
        metadata: {
          filename: 'audio',
          fileSize: audioFile.size,
          processingTime: Date.now() - startTime,
          backend: this.id,
          features: [
            'transcription',
            'word-timestamps',
            ...(settings.enableDiarization ? ['speaker-diarization'] : []),
          ]
        }
      }

      return transcriptionResult
    } catch (error) {
      console.error('AssemblyAI transcription failed:', error)
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private groupWordsIntoSegments(wordSegments: TranscriptionSegment[]): TranscriptionSegment[] {
    if (wordSegments.length === 0) return []

    const segments: TranscriptionSegment[] = []
    let currentSegment: TranscriptionSegment = {
      id: `segment-0`,
      text: '',
      startTime: wordSegments[0].startTime,
      endTime: wordSegments[0].endTime,
      confidence: 0,
      speaker: wordSegments[0].speaker,
      words: []
    }

    for (let i = 0; i < wordSegments.length; i++) {
      const word = wordSegments[i]
      const timeDiff = i > 0 ? word.startTime - wordSegments[i - 1].endTime : 0
      const speakerChanged = currentSegment.speaker !== word.speaker

      // Start new segment if speaker changes or there's a long pause (>2 seconds)
      if ((speakerChanged || timeDiff > 2) && currentSegment.words && currentSegment.words.length > 0) {
        // Finalize current segment
        currentSegment.text = currentSegment.words.map(w => w.word).join(' ')
        currentSegment.confidence = currentSegment.words.reduce((sum, w) => sum + (w.confidence || 0), 0) / currentSegment.words.length
        segments.push(currentSegment)

        // Start new segment
        currentSegment = {
          id: `segment-${segments.length}`,
          text: '',
          startTime: word.startTime,
          endTime: word.endTime,
          confidence: 0,
          speaker: word.speaker,
          words: []
        }
      }

      // Add word to current segment
      if (word.words && word.words.length > 0) {
        currentSegment.words?.push(word.words[0])
        currentSegment.endTime = word.endTime
      }
    }

    // Don't forget the last segment
    if (currentSegment.words && currentSegment.words.length > 0) {
      currentSegment.text = currentSegment.words.map(w => w.word).join(' ')
      currentSegment.confidence = currentSegment.words.reduce((sum, w) => sum + (w.confidence || 0), 0) / currentSegment.words.length
      segments.push(currentSegment)
    }

    return segments
  }

  private mapLanguageCode(language: string): string {
    const mapping: { [key: string]: string } = {
      'en': 'en_us',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'ru': 'ru',
      'ja': 'ja',
      'ko': 'ko',
      'zh': 'zh',
    }
    return mapping[language] || 'en_us'
  }
}