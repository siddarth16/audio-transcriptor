'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  TranscriptionJob, 
  TranscriptionSettings, 
  AppSettings,
  TranscriptionResult 
} from '@/types'

export type AppView = 'transcribe' | 'queue' | 'settings'

interface AppState {
  currentView: AppView
  jobs: TranscriptionJob[]
  settings: AppSettings
  activeJobId?: string
  
  // Actions
  setCurrentView: (view: AppView) => void
  addJob: (job: TranscriptionJob) => void
  updateJob: (id: string, updates: Partial<TranscriptionJob>) => void
  removeJob: (id: string) => void
  setActiveJob: (id?: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  clearJobs: () => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultBackend: 'whisper',
  defaultLanguage: 'auto',
  enableTranslation: false,
  enableDiarization: false,
  enableWordTimestamps: true,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  chunkSize: 10 * 1024 * 1024, // 10MB
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'transcribe',
      jobs: [],
      settings: defaultSettings,
      activeJobId: undefined,

      setCurrentView: (view) => set({ currentView: view }),

      addJob: (job) => set((state) => ({
        jobs: [...state.jobs, job]
      })),

      updateJob: (id, updates) => set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? { ...job, ...updates, updatedAt: Date.now() } : job
        )
      })),

      removeJob: (id) => set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== id),
        activeJobId: state.activeJobId === id ? undefined : state.activeJobId
      })),

      setActiveJob: (id) => set({ activeJobId: id }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      clearJobs: () => set({ jobs: [], activeJobId: undefined }),
    }),
    {
      name: 'audio-transcriptor-store',
      partialize: (state) => ({
        settings: state.settings,
        jobs: state.jobs.filter(job => job.status !== 'processing'), // Don't persist processing jobs
      }),
    }
  )
)