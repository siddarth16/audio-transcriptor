import { validateAudioFile, sanitizeFilename, validateUploadRequest } from '@/lib/validation'

describe('File Validation', () => {
  const mockOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['audio/mp3', 'audio/wav', 'audio/m4a']
  }

  describe('validateAudioFile', () => {
    it('should validate a valid audio file', () => {
      const file = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' })
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 })
      
      const result = validateAudioFile(file, mockOptions)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject oversized files', () => {
      const file = new File(['audio data'], 'large.mp3', { type: 'audio/mp3' })
      Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 })
      
      const result = validateAudioFile(file, mockOptions)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('exceeds maximum limit')
    })

    it('should reject unsupported file types', () => {
      const file = new File(['video data'], 'test.mp4', { type: 'video/mp4' })
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 })
      
      const result = validateAudioFile(file, mockOptions)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not supported')
    })

    it('should reject files with invalid extensions', () => {
      const file = new File(['audio data'], 'test.exe', { type: 'audio/mp3' })
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 })
      
      const result = validateAudioFile(file, mockOptions)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('extension not supported')
    })

    it('should reject files with invalid filename characters', () => {
      const file = new File(['audio data'], 'test<>file.mp3', { type: 'audio/mp3' })
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 })
      
      const result = validateAudioFile(file, mockOptions)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('invalid characters')
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove invalid characters', () => {
      const result = sanitizeFilename('test<>file?.mp3')
      expect(result).toBe('test_file_.mp3')
    })

    it('should handle spaces', () => {
      const result = sanitizeFilename('my audio file.mp3')
      expect(result).toBe('my_audio_file.mp3')
    })

    it('should handle multiple underscores', () => {
      const result = sanitizeFilename('test___file.mp3')
      expect(result).toBe('test_file.mp3')
    })

    it('should trim leading and trailing underscores', () => {
      const result = sanitizeFilename('___test.mp3___')
      expect(result).toBe('test.mp3')
    })

    it('should limit filename length', () => {
      const longFilename = 'a'.repeat(300) + '.mp3'
      const result = sanitizeFilename(longFilename)
      expect(result.length).toBeLessThanOrEqual(255)
    })

    it('should handle empty filenames', () => {
      const result = sanitizeFilename('')
      expect(result).toBe('untitled')
    })
  })

  describe('validateUploadRequest', () => {
    it('should validate a valid upload request', () => {
      const blob = new Blob(['audio data'], { type: 'audio/mp3' })
      Object.defineProperty(blob, 'size', { value: 5 * 1024 * 1024 })
      
      const result = validateUploadRequest(blob, 'test.mp3', 10 * 1024 * 1024)
      expect(result.isValid).toBe(true)
    })

    it('should reject empty files', () => {
      const blob = new Blob([''], { type: 'audio/mp3' })
      Object.defineProperty(blob, 'size', { value: 0 })
      
      const result = validateUploadRequest(blob, 'test.mp3', 10 * 1024 * 1024)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('should reject files without names', () => {
      const blob = new Blob(['audio data'], { type: 'audio/mp3' })
      Object.defineProperty(blob, 'size', { value: 5 * 1024 * 1024 })
      
      const result = validateUploadRequest(blob, '', 10 * 1024 * 1024)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('required')
    })
  })
})