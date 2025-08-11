'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AudioRecording } from '@/types'

interface UseAudioRecorderReturn {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  waveformData: number[]
  error: string | null
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  clearRecording: () => void
  getDevices: () => Promise<MediaDeviceInfo[]>
  setInputDevice: (deviceId: string) => void
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [inputDeviceId, setInputDeviceId] = useState<string>('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close()
      audioContextRef.current = null
    }

    mediaRecorderRef.current = null
    analyserRef.current = null
  }, [])

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecording || isPaused) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate average amplitude
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedValue = average / 255

    setWaveformData(prev => {
      const newData = [...prev, normalizedValue]
      // Keep only last 60 data points (1 second at 60fps)
      return newData.slice(-60)
    })

    animationRef.current = requestAnimationFrame(updateWaveform)
  }, [isRecording, isPaused])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: inputDeviceId ? { exact: inputDeviceId } : undefined,
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Setup audio analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
        setIsRecording(false)
        setIsPaused(false)
        cleanup()
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setIsPaused(false)
      setWaveformData([])

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

      // Start waveform animation
      updateWaveform()

    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Failed to access microphone. Please check permissions.')
      cleanup()
    }
  }, [inputDeviceId, updateWaveform, cleanup])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Restart timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

      // Restart waveform animation
      updateWaveform()
    }
  }, [isRecording, isPaused, updateWaveform])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }, [isRecording])

  const clearRecording = useCallback(() => {
    setAudioBlob(null)
    setDuration(0)
    setWaveformData([])
    setError(null)
    cleanup()
  }, [cleanup])

  const getDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'audioinput')
    } catch (err) {
      console.error('Failed to enumerate devices:', err)
      return []
    }
  }, [])

  const setInputDevice = useCallback((deviceId: string) => {
    setInputDeviceId(deviceId)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    waveformData,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    getDevices,
    setInputDevice,
  }
}