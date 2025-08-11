import { NextRequest, NextResponse } from 'next/server'

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'https://audio-transcriptor.vercel.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

export function validateContentType(request: NextRequest, expectedTypes: string[]): boolean {
  const contentType = request.headers.get('content-type') || ''
  return expectedTypes.some(type => contentType.includes(type))
}

export function validateRequestSize(request: NextRequest, maxSize: number): boolean {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return false
  
  const size = parseInt(contentLength, 10)
  return size <= maxSize
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 255)
}

export class RateLimiter {
  private cache = new Map<string, { count: number; resetTime: number }>()
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  check(identifier: string): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now()
    const record = this.cache.get(identifier)

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs
      this.cache.set(identifier, { count: 1, resetTime })
      return { allowed: true, resetTime, remaining: this.maxRequests - 1 }
    }

    if (record.count >= this.maxRequests) {
      return { allowed: false, resetTime: record.resetTime, remaining: 0 }
    }

    record.count += 1
    return { allowed: true, resetTime: record.resetTime, remaining: this.maxRequests - record.count }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.cache) {
      if (now > record.resetTime) {
        this.cache.delete(key)
      }
    }
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

export function createErrorResponse(
  message: string,
  status: number,
  details?: any
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    },
    { status }
  )

  // Add security headers
  const headers = securityHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}