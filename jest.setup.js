import '@testing-library/jest-dom'
require('./__tests__/setup.ts')

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock MediaRecorder
global.MediaRecorder = class MediaRecorder {
  constructor() {
    this.state = 'inactive'
    this.ondataavailable = null
    this.onstop = null
  }
  start() { this.state = 'recording' }
  stop() { this.state = 'inactive' }
  pause() { this.state = 'paused' }
  resume() { this.state = 'recording' }
}

// Mock HTMLMediaElement
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  writable: true,
  value: false,
})

Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
  writable: true,
  value: 0,
})

Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
  writable: true,
  value: 0,
})

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()