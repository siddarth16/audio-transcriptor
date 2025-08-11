import { NextRequest, NextResponse } from 'next/server'
import { TranscriptionResult, ExportFormat, ExportOptions } from '@/types'

function generateSRT(result: TranscriptionResult, options: ExportOptions): string {
  if (!result.segments || result.segments.length === 0) {
    return result.text
  }

  return result.segments.map((segment, index) => {
    const startTime = formatSRTTime(segment.startTime)
    const endTime = formatSRTTime(segment.endTime)
    
    let text = segment.text
    if (options.includeSpeakers && segment.speaker) {
      text = `${segment.speaker}: ${text}`
    }

    return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`
  }).join('\n')
}

function generateVTT(result: TranscriptionResult, options: ExportOptions): string {
  let content = 'WEBVTT\n\n'
  
  if (!result.segments || result.segments.length === 0) {
    content += `00:00.000 --> ${formatVTTTime(result.duration || 0)}\n${result.text}\n`
    return content
  }

  content += result.segments.map(segment => {
    const startTime = formatVTTTime(segment.startTime)
    const endTime = formatVTTTime(segment.endTime)
    
    let text = segment.text
    if (options.includeSpeakers && segment.speaker) {
      text = `<v ${segment.speaker}>${text}`
    }

    return `${startTime} --> ${endTime}\n${text}\n`
  }).join('\n')

  return content
}

function generateTXT(result: TranscriptionResult, options: ExportOptions): string {
  if (!options.includeTimestamps && !options.includeSpeakers) {
    return result.text
  }

  if (!result.segments || result.segments.length === 0) {
    return result.text
  }

  return result.segments.map(segment => {
    let line = ''
    
    if (options.includeTimestamps) {
      line += `[${formatTimestamp(segment.startTime)}] `
    }
    
    if (options.includeSpeakers && segment.speaker) {
      line += `${segment.speaker}: `
    }
    
    line += segment.text
    return line
  }).join('\n')
}

function generateJSON(result: TranscriptionResult, options: ExportOptions): string {
  const exportData = {
    text: result.text,
    language: result.language,
    duration: result.duration,
    segments: result.segments.map(segment => ({
      id: segment.id,
      text: segment.text,
      startTime: segment.startTime,
      endTime: segment.endTime,
      ...(options.includeSpeakers && segment.speaker ? { speaker: segment.speaker } : {}),
      ...(options.includeConfidence && segment.confidence !== undefined ? { confidence: segment.confidence } : {}),
      ...(segment.words && segment.words.length > 0 ? { words: segment.words } : {}),
    })),
    metadata: {
      ...result.metadata,
      exportOptions: options,
      exportedAt: new Date().toISOString(),
    }
  }

  return JSON.stringify(exportData, null, 2)
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

function formatVTTTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { result, format, options, filename } = body as {
      result: TranscriptionResult
      format: ExportFormat
      options: ExportOptions
      filename: string
    }

    if (!result || !format || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: result, format, filename' },
        { status: 400 }
      )
    }

    let content: string
    let mimeType: string
    let extension: string

    switch (format) {
      case 'srt':
        content = generateSRT(result, options)
        mimeType = 'application/x-subrip'
        extension = '.srt'
        break
      case 'vtt':
        content = generateVTT(result, options)
        mimeType = 'text/vtt'
        extension = '.vtt'
        break
      case 'txt':
        content = generateTXT(result, options)
        mimeType = 'text/plain'
        extension = '.txt'
        break
      case 'json':
        content = generateJSON(result, options)
        mimeType = 'application/json'
        extension = '.json'
        break
      default:
        return NextResponse.json(
          { error: `Unsupported export format: ${format}` },
          { status: 400 }
        )
    }

    const exportFilename = filename.replace(/\.[^/.]+$/, '') + extension
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${exportFilename}"`,
        'Content-Length': Buffer.byteLength(content, 'utf8').toString(),
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export transcript' },
      { status: 500 }
    )
  }
}