'use client'

import React, { useState, useEffect } from 'react'
import { Mic, ChevronDown } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'

export function DeviceSelector() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { getDevices, setInputDevice } = useAudioRecorder()

  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioDevices = await getDevices()
        setDevices(audioDevices)
        
        // Set default device
        if (audioDevices.length > 0 && !selectedDevice) {
          const defaultDevice = audioDevices[0]
          setSelectedDevice(defaultDevice.deviceId)
          setInputDevice(defaultDevice.deviceId)
        }
      } catch (error) {
        console.warn('Could not access audio devices:', error)
      }
    }

    loadDevices()

    // Listen for device changes
    const handleDeviceChange = () => {
      loadDevices()
    }

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [getDevices, setInputDevice, selectedDevice])

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId)
    setInputDevice(deviceId)
    setIsOpen(false)
  }

  const selectedDeviceInfo = devices.find(d => d.deviceId === selectedDevice)

  if (devices.length <= 1) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Mic className="h-4 w-4" />
        <span>Using default microphone</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-gray-100 dark:bg-dark-700 rounded-md hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Mic className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-900 dark:text-gray-100">
            {selectedDeviceInfo?.label || 'Select microphone'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
          {devices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => handleDeviceSelect(device.deviceId)}
              className={`
                w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors
                ${selectedDevice === device.deviceId ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}
              `}
            >
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span className="truncate">
                  {device.label || `Microphone ${device.deviceId.slice(-4)}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}