import { TranscriptionBackend } from '@/types'
import { SimpleWhisperBackend } from './simple-whisper'

const backends = new Map<string, () => TranscriptionBackend>()

function registerBackend(id: string, factory: () => TranscriptionBackend) {
  backends.set(id, factory)
}

// Register simple backend that definitely works
registerBackend('whisper', () => new SimpleWhisperBackend() as any)

export function getAvailableBackends(): TranscriptionBackend[] {
  return [backends.get('whisper')!()] 
}

export function getBackend(id: string): TranscriptionBackend | null {
  const factory = backends.get(id)
  return factory ? factory() : null
}

export function getDefaultBackend(): TranscriptionBackend | null {
  return backends.get('whisper')!()
}

export function isBackendAvailable(id: string): boolean {
  return backends.has(id)
}