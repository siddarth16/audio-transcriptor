import { NextRequest, NextResponse } from 'next/server'
import { getBackend } from '@/lib/transcription/registry'
import { validateUploadRequest } from '@/lib/validation'
import { TranscriptionSettings } from '@/types'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '100') * 1024 * 1024
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX_FILES = parseInt(process.env.MAX_FILES_PER_HOUR || '10')

// Simple in-memory rate limiting (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `transcribe:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, resetTime: now + RATE_LIMIT_WINDOW }
  }

  if (record.count >= RATE_LIMIT_MAX_FILES) {
    return { allowed: false, resetTime: record.resetTime }
  }

  record.count += 1
  return { allowed: true, resetTime: record.resetTime }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    const { allowed, resetTime } = checkRateLimit(rateLimitKey)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetTime },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_FILES.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
          }
        }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const settingsString = formData.get('settings') as string

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    if (!settingsString) {
      return NextResponse.json({ error: 'No transcription settings provided' }, { status: 400 })
    }

    // Parse settings
    let settings: TranscriptionSettings
    try {
      settings = JSON.parse(settingsString)
    } catch {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
    }

    // Validate file
    const validation = validateUploadRequest(audioFile, audioFile.name, MAX_FILE_SIZE)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Get transcription backend
    const backend = getBackend(settings.backend)
    if (!backend) {
      return NextResponse.json(
        { error: `Backend '${settings.backend}' is not available` },
        { status: 400 }
      )
    }

    // Validate backend capabilities
    if (settings.enableDiarization && !backend.features.diarization) {
      return NextResponse.json(
        { error: 'Selected backend does not support speaker diarization' },
        { status: 400 }
      )
    }

    if (settings.enableTranslation && !backend.features.translation) {
      return NextResponse.json(
        { error: 'Selected backend does not support translation' },
        { status: 400 }
      )
    }

    // Convert File to Blob for backend processing
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Perform transcription
    const result = await backend.transcribe(audioBlob, settings, (progress) => {
      // In a real implementation, you might want to use Server-Sent Events
      // or WebSocket to stream progress back to the client
      console.log(`Transcription progress: ${progress}%`)
    })

    return NextResponse.json({
      success: true,
      result,
    })

  } catch (error) {
    console.error('Transcription error:', error)
    
    // Don't expose internal errors to the client
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const statusCode = errorMessage.includes('API key') ? 503 : 500
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

export async function GET() {
  // Return available backends and their capabilities
  try {
    const { getAvailableBackends } = await import('@/lib/transcription/registry')
    const backends = getAvailableBackends()
    
    return NextResponse.json({
      backends: backends.map(backend => ({
        id: backend.id,
        name: backend.name,
        description: backend.description,
        maxFileSize: backend.maxFileSize,
        maxDuration: backend.maxDuration,
        supportedFormats: backend.supportedFormats,
        features: backend.features,
      }))
    })
  } catch (error) {
    console.error('Failed to get backends:', error)
    return NextResponse.json(
      { error: 'Failed to get available backends' },
      { status: 500 }
    )
  }
}