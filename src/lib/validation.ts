interface FileValidationOptions {
  maxSize: number
  allowedTypes: string[]
  maxDuration?: number
}

interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateAudioFile(file: File, options: FileValidationOptions): ValidationResult {
  // Check file size
  if (file.size > options.maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${Math.round(options.maxSize / (1024 * 1024))}MB`
    }
  }

  // Check file type
  const fileType = file.type.toLowerCase()
  const isValidType = options.allowedTypes.some(type => 
    fileType === type || fileType.startsWith(type.split('/')[0] + '/')
  )

  if (!isValidType) {
    return {
      isValid: false,
      error: `File type ${fileType} is not supported. Supported types: ${options.allowedTypes.join(', ')}`
    }
  }

  // Check filename
  const filename = file.name.toLowerCase()
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac', '.aac', '.mp4']
  const hasValidExtension = allowedExtensions.some(ext => filename.endsWith(ext))

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `File extension not supported. Supported extensions: ${allowedExtensions.join(', ')}`
    }
  }

  // Validate filename characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
  if (invalidChars.test(file.name)) {
    return {
      isValid: false,
      error: 'Filename contains invalid characters'
    }
  }

  return { isValid: true }
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  let sanitized = filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'untitled'
  }

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    const name = sanitized.substring(0, sanitized.lastIndexOf('.'))
    sanitized = name.substring(0, 255 - ext.length) + ext
  }

  return sanitized
}

export function validateUploadRequest(
  file: Blob, 
  filename: string, 
  maxSize: number
): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file provided' }
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' }
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File size exceeds maximum limit of ${Math.round(maxSize / (1024 * 1024))}MB` 
    }
  }

  if (!filename || filename.trim().length === 0) {
    return { isValid: false, error: 'Filename is required' }
  }

  const sanitizedFilename = sanitizeFilename(filename)
  if (sanitizedFilename.length === 0) {
    return { isValid: false, error: 'Invalid filename' }
  }

  return { isValid: true }
}