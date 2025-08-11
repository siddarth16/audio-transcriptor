'use client'

import React, { useState } from 'react'
import { Download, X, FileText, Clock, BarChart3 } from 'lucide-react'
import { TranscriptionJob, ExportFormat } from '@/types'
import { clsx } from 'clsx'

interface ExportOptionsProps {
  job: TranscriptionJob
  onExport: (_format: ExportFormat, _options: any) => void
  onClose: () => void
}

const exportFormats = [
  {
    id: 'txt' as ExportFormat,
    name: 'Plain Text',
    description: 'Simple text format with no timing information',
    icon: FileText,
    extension: '.txt'
  },
  {
    id: 'srt' as ExportFormat,
    name: 'SubRip (SRT)',
    description: 'Standard subtitle format with timestamps',
    icon: Clock,
    extension: '.srt'
  },
  {
    id: 'vtt' as ExportFormat,
    name: 'WebVTT',
    description: 'Web video text tracks format',
    icon: Clock,
    extension: '.vtt'
  },
  {
    id: 'json' as ExportFormat,
    name: 'JSON',
    description: 'Complete data with all metadata and timing',
    icon: BarChart3,
    extension: '.json'
  }
]

export function ExportOptions({ job, onExport, onClose }: ExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('srt')
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [includeSpeakers, setIncludeSpeakers] = useState(true)
  const [includeConfidence, setIncludeConfidence] = useState(false)

  const handleExport = () => {
    const options = {
      includeTimestamps,
      includeSpeakers,
      includeConfidence,
    }
    onExport(selectedFormat, options)
  }

  const selectedFormatInfo = exportFormats.find(f => f.id === selectedFormat)
  const result = job.result

  if (!result) return null

  const hasTimestamps = result.segments.length > 0
  const hasSpeakers = result.segments.some(s => s.speaker)
  const hasConfidence = result.segments.some(s => s.confidence !== undefined)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Export Transcript
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Choose Export Format
            </h3>
            
            <div className="grid gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={clsx(
                      'text-left p-4 rounded-lg border-2 transition-colors',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={clsx(
                        'h-5 w-5 mt-0.5',
                        isSelected 
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {format.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {format.description}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {format.extension}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Export Options
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include Timestamps
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add timing information for segments
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimestamps && hasTimestamps}
                    onChange={(e) => setIncludeTimestamps(e.target.checked)}
                    disabled={!hasTimestamps || selectedFormat === 'txt'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include Speakers
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show speaker labels if available
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSpeakers && hasSpeakers}
                    onChange={(e) => setIncludeSpeakers(e.target.checked)}
                    disabled={!hasSpeakers}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include Confidence Scores
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add accuracy confidence for each segment
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeConfidence && hasConfidence}
                    onChange={(e) => setIncludeConfidence(e.target.checked)}
                    disabled={!hasConfidence || selectedFormat !== 'json'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedFormatInfo && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Preview
              </h3>
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {job.filename.replace(/\.[^/.]+$/, '')} {selectedFormatInfo.extension}
                </div>
                <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {selectedFormat === 'txt' && (
                    <div>
                      {result.segments.slice(0, 2).map(s => s.text).join(' ')}
                      {result.segments.length > 2 && '...'}
                    </div>
                  )}
                  {selectedFormat === 'srt' && (
                    <div>
                      1<br/>
                      00:00:00,000 --&gt; 00:00:05,000<br/>
                      {result.segments[0]?.text || 'Sample text'}<br/><br/>
                      2<br/>
                      00:00:05,000 --&gt; 00:00:10,000<br/>
                      {result.segments[1]?.text || 'More sample text'}
                    </div>
                  )}
                  {selectedFormat === 'vtt' && (
                    <div>
                      WEBVTT<br/><br/>
                      00:00.000 --&gt; 00:05.000<br/>
                      {result.segments[0]?.text || 'Sample text'}<br/><br/>
                      00:05.000 --&gt; 00:10.000<br/>
                      {result.segments[1]?.text || 'More sample text'}
                    </div>
                  )}
                  {selectedFormat === 'json' && (
                    <div>
                      {`{`}<br/>
                      &nbsp;&nbsp;"text": "{result.text.slice(0, 50)}...",<br/>
                      &nbsp;&nbsp;"segments": [{result.segments.length}],<br/>
                      &nbsp;&nbsp;"language": "{result.language}",<br/>
                      &nbsp;&nbsp;"confidence": {result.confidence}<br/>
                      {`}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-dark-600">
          <button
            onClick={onClose}
            className="btn btn-outline btn-md"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary btn-md"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {selectedFormatInfo?.name}
          </button>
        </div>
      </div>
    </div>
  )
}