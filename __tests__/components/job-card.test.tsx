import { render, screen, fireEvent } from '@testing-library/react'
import { JobCard } from '@/components/queue/job-card'
import { TranscriptionJob } from '@/types'

const mockJob: TranscriptionJob = {
  id: 'test-job-1',
  filename: 'test-audio.mp3',
  fileSize: 1024 * 1024,
  status: 'completed',
  progress: 100,
  createdAt: Date.now() - 60000, // 1 minute ago
  updatedAt: Date.now(),
  settings: {
    language: 'en',
    backend: 'whisper',
    enableTranslation: false,
    enableDiarization: false,
    enableWordTimestamps: true,
  },
  result: {
    id: 'result-1',
    text: 'This is a test transcription.',
    segments: [
      {
        id: 'segment-1',
        text: 'This is a test transcription.',
        startTime: 0,
        endTime: 2.5,
        confidence: 0.95,
      }
    ],
    language: 'en',
    confidence: 0.95,
    duration: 2.5,
    metadata: {
      filename: 'test-audio.mp3',
      fileSize: 1024 * 1024,
      processingTime: 5000,
      backend: 'whisper',
      features: ['transcription', 'word-timestamps']
    }
  }
}

describe('JobCard', () => {
  const mockOnView = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    mockOnView.mockClear()
    mockOnRemove.mockClear()
  })

  it('should render job information correctly', () => {
    render(<JobCard job={mockJob} onView={mockOnView} onRemove={mockOnRemove} />)
    
    expect(screen.getByText('test-audio.mp3')).toBeInTheDocument()
    expect(screen.getByText('1.0 MB')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('whisper')).toBeInTheDocument()
  })

  it('should show View Result button for completed jobs', () => {
    render(<JobCard job={mockJob} onView={mockOnView} onRemove={mockOnRemove} />)
    
    const viewButton = screen.getByText('View Result')
    expect(viewButton).toBeInTheDocument()
    
    fireEvent.click(viewButton)
    expect(mockOnView).toHaveBeenCalledTimes(1)
  })

  it('should not show View Result button for incomplete jobs', () => {
    const processingJob = { ...mockJob, status: 'processing' as const, result: undefined }
    render(<JobCard job={processingJob} onView={mockOnView} onRemove={mockOnRemove} />)
    
    expect(screen.queryByText('View Result')).not.toBeInTheDocument()
  })

  it('should show progress bar for processing jobs', () => {
    const processingJob = { 
      ...mockJob, 
      status: 'processing' as const, 
      progress: 45,
      result: undefined 
    }
    render(<JobCard job={processingJob} />)
    
    expect(screen.getByText('45% complete')).toBeInTheDocument()
  })

  it('should show error message for failed jobs', () => {
    const failedJob = { 
      ...mockJob, 
      status: 'failed' as const, 
      error: 'Transcription service unavailable',
      result: undefined 
    }
    render(<JobCard job={failedJob} />)
    
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Transcription service unavailable')).toBeInTheDocument()
  })

  it('should handle remove action', () => {
    render(<JobCard job={mockJob} onView={mockOnView} onRemove={mockOnRemove} />)
    
    const removeButton = screen.getByLabelText(/remove/i) || screen.getByRole('button', { name: '' })
    if (removeButton) {
      fireEvent.click(removeButton)
      expect(mockOnRemove).toHaveBeenCalledTimes(1)
    }
  })

  it('should render in compact mode', () => {
    render(<JobCard job={mockJob} compact />)
    
    // In compact mode, detailed settings should not be visible
    expect(screen.getByText('test-audio.mp3')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should show speaker information when available', () => {
    const jobWithSpeaker = {
      ...mockJob,
      result: {
        ...mockJob.result!,
        segments: [
          {
            ...mockJob.result!.segments[0],
            speaker: 'Speaker A'
          }
        ]
      }
    }
    
    render(<JobCard job={jobWithSpeaker} />)
    expect(screen.getByText(/speaker/i)).toBeInTheDocument()
  })

  it('should display confidence scores', () => {
    render(<JobCard job={mockJob} />)
    expect(screen.getByText('95%')).toBeInTheDocument()
  })
})