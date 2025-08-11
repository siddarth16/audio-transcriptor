import { FeatureFlags } from '@/types'

export function getFeatureFlags(): FeatureFlags {
  return {
    enableWhisperBackend: process.env.ENABLE_WHISPER_BACKEND !== 'false',
    enableAssemblyAIBackend: process.env.ENABLE_ASSEMBLYAI_BACKEND !== 'false',
    enableDiarization: process.env.ENABLE_DIARIZATION !== 'false',
    enableTranslation: process.env.ENABLE_TRANSLATION !== 'false',
    enableWordTimestamps: true,
  }
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags()
  return flags[feature]
}