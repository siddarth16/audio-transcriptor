import { NextResponse } from 'next/server'
import { getAvailableBackends } from '@/lib/transcription/registry'
import { getFeatureFlags } from '@/lib/feature-flags'

export async function GET() {
  try {
    const backends = getAvailableBackends()
    const features = getFeatureFlags()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      backends: {
        available: backends.length,
        configured: backends.map(b => ({
          id: b.id,
          name: b.name,
          features: b.features,
        })),
      },
      features,
      limits: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '100'),
        maxFilesPerHour: parseInt(process.env.MAX_FILES_PER_HOUR || '10'),
        maxDuration: parseInt(process.env.MAX_DURATION_MINUTES || '30'),
      },
      services: {
        vercelBlob: !!process.env.BLOB_READ_WRITE_TOKEN,
        openai: !!process.env.OPENAI_API_KEY,
        assemblyai: !!process.env.ASSEMBLYAI_API_KEY,
      }
    }

    // Check if any critical services are missing
    if (backends.length === 0) {
      health.status = 'degraded'
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    )
  }
}