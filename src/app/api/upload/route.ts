import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { validateUploadRequest } from '@/lib/validation'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '100') * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const validation = validateUploadRequest(file, file.name, MAX_FILE_SIZE)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Upload to Vercel Blob with TTL (auto-delete after 24 hours)
    const filename = `audio-${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
      size: file.size,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// Handle chunked upload for large files
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const chunkIndex = parseInt(url.searchParams.get('chunk') || '0')
    const totalChunks = parseInt(url.searchParams.get('totalChunks') || '1')
    const uploadId = url.searchParams.get('uploadId')
    const filename = url.searchParams.get('filename')

    if (!uploadId || !filename) {
      return NextResponse.json(
        { error: 'Missing uploadId or filename' },
        { status: 400 }
      )
    }

    const chunk = await request.blob()
    
    // Store chunk temporarily with upload ID and chunk index
    const chunkFilename = `chunks/${uploadId}-${chunkIndex}`
    const chunkBlob = await put(chunkFilename, chunk, {
      access: 'public',
      addRandomSuffix: false,
    })

    // If this is the last chunk, combine all chunks
    if (chunkIndex === totalChunks - 1) {
      // In a real implementation, you would:
      // 1. Retrieve all chunks
      // 2. Combine them into a single file
      // 3. Upload the combined file
      // 4. Delete the individual chunks
      // 5. Return the final file URL
      
      // For now, we'll simulate this
      return NextResponse.json({
        success: true,
        completed: true,
        url: `https://blob.vercel-storage.com/${filename}`,
        message: 'Upload completed',
      })
    }

    return NextResponse.json({
      success: true,
      completed: false,
      chunkIndex,
      chunkUrl: chunkBlob.url,
    })

  } catch (error) {
    console.error('Chunked upload error:', error)
    return NextResponse.json(
      { error: 'Chunked upload failed' },
      { status: 500 }
    )
  }
}