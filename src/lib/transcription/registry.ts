import { TranscriptionBackend } from '@/types'
import { WhisperTranscriptionService } from './whisper-backend'
import { AssemblyAITranscriptionService } from './assemblyai-backend'
import { getFeatureFlags } from '../feature-flags'

const backends = new Map<string, () => TranscriptionBackend>()

function registerBackend(id: string, factory: () => TranscriptionBackend) {
  backends.set(id, factory)
}

// Register available backends
if (process.env.OPENAI_API_KEY) {
  registerBackend('whisper', () => new WhisperTranscriptionService())
}

if (process.env.ASSEMBLYAI_API_KEY) {
  registerBackend('assemblyai', () => new AssemblyAITranscriptionService())
}

export function getAvailableBackends(): TranscriptionBackend[] {
  const flags = getFeatureFlags()
  const availableBackends: TranscriptionBackend[] = []

  if (flags.enableWhisperBackend && backends.has('whisper')) {
    try {
      availableBackends.push(backends.get('whisper')!())
    } catch (error) {
      console.warn('Whisper backend not available:', error)
    }
  }

  if (flags.enableAssemblyAIBackend && backends.has('assemblyai')) {
    try {
      availableBackends.push(backends.get('assemblyai')!())
    } catch (error) {
      console.warn('AssemblyAI backend not available:', error)
    }
  }

  return availableBackends
}

export function getBackend(id: string): TranscriptionBackend | null {
  const factory = backends.get(id)
  if (!factory) {
    return null
  }

  try {
    return factory()
  } catch (error) {
    console.error(`Failed to create backend ${id}:`, error)
    return null
  }
}

export function getDefaultBackend(): TranscriptionBackend | null {
  const available = getAvailableBackends()
  return available.length > 0 ? available[0] : null
}

export function isBackendAvailable(id: string): boolean {
  return backends.has(id) && getAvailableBackends().some(b => b.id === id)
}