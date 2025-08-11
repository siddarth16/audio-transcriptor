/**
 * @jest-environment node
 */

import { getAvailableBackends, getBackend, isBackendAvailable } from '@/lib/transcription/registry'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterAll(() => {
  process.env = originalEnv
})

describe('Transcription Registry', () => {
  describe('getAvailableBackends', () => {
    it('should return empty array when no backends are configured', () => {
      delete process.env.OPENAI_API_KEY
      delete process.env.ASSEMBLYAI_API_KEY
      
      const backends = getAvailableBackends()
      expect(backends).toHaveLength(0)
    })

    it('should return whisper backend when OpenAI key is provided', () => {
      process.env.OPENAI_API_KEY = 'test-key'
      delete process.env.ASSEMBLYAI_API_KEY
      
      const backends = getAvailableBackends()
      const whisperBackend = backends.find(b => b.id === 'whisper')
      
      expect(whisperBackend).toBeDefined()
      expect(whisperBackend?.name).toBe('OpenAI Whisper')
      expect(whisperBackend?.features.wordTimestamps).toBe(true)
      expect(whisperBackend?.features.translation).toBe(true)
      expect(whisperBackend?.features.diarization).toBe(false)
    })

    it('should return AssemblyAI backend when API key is provided', () => {
      delete process.env.OPENAI_API_KEY
      process.env.ASSEMBLYAI_API_KEY = 'test-key'
      
      const backends = getAvailableBackends()
      const assemblyBackend = backends.find(b => b.id === 'assemblyai')
      
      expect(assemblyBackend).toBeDefined()
      expect(assemblyBackend?.name).toBe('AssemblyAI')
      expect(assemblyBackend?.features.wordTimestamps).toBe(true)
      expect(assemblyBackend?.features.diarization).toBe(true)
      expect(assemblyBackend?.features.translation).toBe(false)
    })

    it('should return both backends when both keys are provided', () => {
      process.env.OPENAI_API_KEY = 'test-key'
      process.env.ASSEMBLYAI_API_KEY = 'test-key'
      
      const backends = getAvailableBackends()
      expect(backends).toHaveLength(2)
      
      const backendIds = backends.map(b => b.id)
      expect(backendIds).toContain('whisper')
      expect(backendIds).toContain('assemblyai')
    })
  })

  describe('getBackend', () => {
    it('should return null for non-existent backend', () => {
      const backend = getBackend('non-existent')
      expect(backend).toBeNull()
    })

    it('should return backend when it exists', () => {
      process.env.OPENAI_API_KEY = 'test-key'
      
      const backend = getBackend('whisper')
      expect(backend).toBeDefined()
      expect(backend?.id).toBe('whisper')
    })
  })

  describe('isBackendAvailable', () => {
    it('should return false for non-configured backend', () => {
      delete process.env.OPENAI_API_KEY
      expect(isBackendAvailable('whisper')).toBe(false)
    })

    it('should return true for configured backend', () => {
      process.env.OPENAI_API_KEY = 'test-key'
      expect(isBackendAvailable('whisper')).toBe(true)
    })
  })
})

describe('Backend Interfaces', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key'
  })

  it('should have required properties and methods', () => {
    const backend = getBackend('whisper')
    expect(backend).toBeDefined()
    
    if (backend) {
      expect(backend.id).toBeDefined()
      expect(backend.name).toBeDefined()
      expect(backend.description).toBeDefined()
      expect(backend.maxFileSize).toBeGreaterThan(0)
      expect(backend.maxDuration).toBeGreaterThan(0)
      expect(Array.isArray(backend.supportedFormats)).toBe(true)
      expect(backend.features).toBeDefined()
      expect(typeof backend.transcribe).toBe('function')
    }
  })

  it('should validate supported formats', () => {
    const backend = getBackend('whisper')
    expect(backend?.supportedFormats).toContain('mp3')
    expect(backend?.supportedFormats).toContain('wav')
  })
})