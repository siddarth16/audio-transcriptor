import { 
  generateTranscriptionJob, 
  formatFileSize, 
  formatDuration,
  getJobStatusText,
  getJobStatusColor,
  calculateETA,
  isJobProcessing,
  isJobCompleted,
  isJobFailed
} from '@/lib/job-utils'

describe('Job Utils', () => {
  describe('generateTranscriptionJob', () => {
    it('should create a valid transcription job', () => {
      const blob = new Blob(['audio data'], { type: 'audio/mp3' })
      Object.defineProperty(blob, 'size', { value: 1024 * 1024 })
      
      const settings = {
        language: 'en',
        backend: 'whisper',
        enableTranslation: false,
        enableDiarization: false,
        enableWordTimestamps: true,
      }

      const job = generateTranscriptionJob(blob, 'test.mp3', settings)
      
      expect(job.id).toBeDefined()
      expect(job.filename).toBe('test.mp3')
      expect(job.fileSize).toBe(1024 * 1024)
      expect(job.status).toBe('queued')
      expect(job.progress).toBe(0)
      expect(job.settings).toEqual(settings)
      expect(job.createdAt).toBeGreaterThan(0)
      expect(job.updatedAt).toBeGreaterThan(0)
    })

    it('should sanitize filenames', () => {
      const blob = new Blob(['audio data'], { type: 'audio/mp3' })
      Object.defineProperty(blob, 'size', { value: 1024 })
      
      const settings = {
        language: 'en',
        backend: 'whisper',
        enableTranslation: false,
        enableDiarization: false,
        enableWordTimestamps: true,
      }

      const job = generateTranscriptionJob(blob, 'test<>file?.mp3', settings)
      expect(job.filename).toBe('test_file_.mp3')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
    })

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(30)).toBe('30s')
      expect(formatDuration(90)).toBe('1m 30s')
      expect(formatDuration(3661)).toBe('1h 1m 1s')
      expect(formatDuration(7200)).toBe('2h 0m 0s')
    })

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0s')
    })
  })

  describe('getJobStatusText', () => {
    it('should return correct status text', () => {
      expect(getJobStatusText('queued')).toBe('Queued')
      expect(getJobStatusText('processing')).toBe('Processing')
      expect(getJobStatusText('completed')).toBe('Completed')
      expect(getJobStatusText('failed')).toBe('Failed')
      expect(getJobStatusText('cancelled')).toBe('Cancelled')
    })
  })

  describe('getJobStatusColor', () => {
    it('should return correct color classes', () => {
      expect(getJobStatusColor('queued')).toContain('text-blue-600')
      expect(getJobStatusColor('processing')).toContain('text-yellow-600')
      expect(getJobStatusColor('completed')).toContain('text-green-600')
      expect(getJobStatusColor('failed')).toContain('text-red-600')
      expect(getJobStatusColor('cancelled')).toContain('text-gray-600')
    })
  })

  describe('calculateETA', () => {
    it('should calculate ETA correctly', () => {
      const startTime = Date.now() - 30000 // 30 seconds ago
      const progress = 0.5 // 50% complete
      
      const eta = calculateETA(progress, startTime)
      expect(eta).toContain('remaining')
    })

    it('should handle zero progress', () => {
      const startTime = Date.now()
      const eta = calculateETA(0, startTime)
      expect(eta).toBe('Calculating...')
    })
  })

  describe('job status helpers', () => {
    const mockJob = (status: any) => ({ 
      id: '1', 
      filename: 'test.mp3',
      fileSize: 1024,
      status,
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        language: 'en',
        backend: 'whisper',
        enableTranslation: false,
        enableDiarization: false,
        enableWordTimestamps: true,
      }
    })

    it('should identify processing jobs', () => {
      expect(isJobProcessing(mockJob('queued'))).toBe(true)
      expect(isJobProcessing(mockJob('processing'))).toBe(true)
      expect(isJobProcessing(mockJob('completed'))).toBe(false)
    })

    it('should identify completed jobs', () => {
      expect(isJobCompleted(mockJob('completed'))).toBe(true)
      expect(isJobCompleted(mockJob('processing'))).toBe(false)
    })

    it('should identify failed jobs', () => {
      expect(isJobFailed(mockJob('failed'))).toBe(true)
      expect(isJobFailed(mockJob('completed'))).toBe(false)
    })
  })
})