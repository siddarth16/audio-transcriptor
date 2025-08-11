'use client'

import React from 'react'
import { Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getAvailableBackends } from '@/lib/transcription/registry'
import { useToast } from '@/hooks/use-toast'

export function Settings() {
  const { settings, updateSettings } = useAppStore()
  const { toast } = useToast()
  const featureFlags = getFeatureFlags()
  const backends = getAvailableBackends()

  const handleSave = () => {
    toast.success('Settings saved', 'Your preferences have been updated successfully')
  }

  const handleReset = () => {
    updateSettings({
      theme: 'dark',
      defaultBackend: 'whisper',
      defaultLanguage: 'auto',
      enableTranslation: false,
      enableDiarization: false,
      enableWordTimestamps: true,
      maxFileSize: 100 * 1024 * 1024,
      chunkSize: 10 * 1024 * 1024,
    })
    toast.info('Settings reset', 'All settings have been restored to defaults')
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your transcription preferences and application behavior
          </p>
        </div>

        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Transcription Settings
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Backend
                </label>
                <select
                  value={settings.defaultBackend}
                  onChange={(e) => updateSettings({ defaultBackend: e.target.value })}
                  className="input"
                >
                  {backends.map((backend) => (
                    <option key={backend.id} value={backend.id}>
                      {backend.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose your preferred transcription service
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Language
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                  className="input"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Word Timestamps
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Include precise timing for each word
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableWordTimestamps}
                    onChange={(e) => updateSettings({ enableWordTimestamps: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {featureFlags.enableTranslation && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Translation
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically translate to English
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableTranslation}
                      onChange={(e) => updateSettings({ enableTranslation: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              )}

              {featureFlags.enableDiarization && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Speaker Diarization
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Identify different speakers in conversations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableDiarization}
                      onChange={(e) => updateSettings({ enableDiarization: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Upload Settings
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={Math.round(settings.maxFileSize / (1024 * 1024))}
                  onChange={(e) => updateSettings({ maxFileSize: parseInt(e.target.value) * 1024 * 1024 })}
                  className="input"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum size for uploaded audio files
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chunk Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={Math.round(settings.chunkSize / (1024 * 1024))}
                  onChange={(e) => updateSettings({ chunkSize: parseInt(e.target.value) * 1024 * 1024 })}
                  className="input"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Size of file chunks for upload
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Privacy & Security
            </h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Data Processing Notice
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Audio files are processed by third-party services and temporarily stored for transcription.
                    Files are automatically deleted after processing. No data is permanently stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="text-sm">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">
                    Security Features
                  </h3>
                  <ul className="text-green-700 dark:text-green-300 list-disc list-inside space-y-1">
                    <li>All data transmission is encrypted (HTTPS)</li>
                    <li>Files are validated for type and size</li>
                    <li>Rate limiting prevents abuse</li>
                    <li>No analytics or tracking by default</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="btn btn-outline btn-md"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </button>
          
          <button
            onClick={handleSave}
            className="btn btn-primary btn-md"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}