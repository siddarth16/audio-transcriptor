import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, securityHeaders, RateLimiter, getClientIP } from '@/lib/middleware'

// Rate limiters for different endpoints
const transcriptionLimiter = new RateLimiter(10, 60 * 60 * 1000) // 10 requests per hour
const uploadLimiter = new RateLimiter(20, 60 * 60 * 1000) // 20 requests per hour
const generalLimiter = new RateLimiter(100, 60 * 1000) // 100 requests per minute

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(),
    })
  }

  // Apply security headers to all responses
  const response = NextResponse.next()
  const headers = { ...corsHeaders(), ...securityHeaders() }
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting for API routes
  const pathname = request.nextUrl.pathname
  const clientIP = getClientIP(request)

  if (pathname.startsWith('/api/')) {
    let limiter: RateLimiter
    let identifier: string

    if (pathname === '/api/transcribe') {
      limiter = transcriptionLimiter
      identifier = `transcribe:${clientIP}`
    } else if (pathname === '/api/upload') {
      limiter = uploadLimiter
      identifier = `upload:${clientIP}`
    } else {
      limiter = generalLimiter
      identifier = `general:${clientIP}`
    }

    const { allowed, resetTime, remaining } = limiter.check(identifier)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            ...headers,
            'X-RateLimit-Reset': resetTime.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())
  }

  // Clean up rate limiters periodically
  if (Math.random() < 0.01) { // 1% chance
    transcriptionLimiter.cleanup()
    uploadLimiter.cleanup()
    generalLimiter.cleanup()
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}