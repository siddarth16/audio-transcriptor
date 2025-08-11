'use client'

import React from 'react'

interface WaveformVisualizerProps {
  waveformData: number[]
  isRecording: boolean
  duration: number
  className?: string
}

export function WaveformVisualizer({ 
  waveformData, 
  isRecording, 
  duration,
  className = '' 
}: WaveformVisualizerProps) {
  const bars = Array.from({ length: 60 }, (_, i) => {
    const dataIndex = Math.max(0, waveformData.length - 60 + i)
    const value = waveformData[dataIndex] || 0
    return Math.max(0.1, value) // Minimum height for visual consistency
  })

  return (
    <div className={`relative h-24 bg-gray-100 dark:bg-dark-700 rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-end justify-center gap-1 p-2">
        {bars.map((height, index) => (
          <div
            key={index}
            className={`
              flex-1 max-w-[3px] rounded-sm transition-all duration-100
              ${isRecording 
                ? 'waveform-bar animate-pulse' 
                : 'bg-gray-300 dark:bg-dark-600'
              }
            `}
            style={{ 
              height: `${Math.max(4, height * 80)}px`,
              animationDelay: `${index * 20}ms`
            }}
          />
        ))}
      </div>
      
      {!isRecording && waveformData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            <div className="mb-2">🎙️</div>
            <div>Press record to start</div>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="absolute top-2 left-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              REC
            </span>
          </div>
        </div>
      )}
    </div>
  )
}