import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const start = performance.now();
  
  let supabaseResponse = NextResponse.next({
    request
  })

  // Supabase auth check for protected routes
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes - redirect to login if not authenticated
    const protectedRoutes = ['/admin', '/dashboard', '/profile']
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
    
    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Authenticated users accessing root should go to dashboard
    if (request.nextUrl.pathname === '/' && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Already authenticated users shouldn't access auth pages
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
    const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)
    
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // Rate limiting için basit kontrol
  const rateLimit = parseInt(process.env.API_RATE_LIMIT || '100');
  
  // Performance headers ekle
  const duration = performance.now() - start;
  supabaseResponse.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  supabaseResponse.headers.set('X-Timestamp', Date.now().toString());
  
  // Security headers
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Minimal CSP (UI kırılmasını önlemek için temkinli)
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
    "connect-src 'self' https: http:",
    "font-src 'self' data: https:",
    "frame-ancestors 'none'",
  ].join('; ')
  supabaseResponse.headers.set('Content-Security-Policy', csp)
  
  // Cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    supabaseResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // API route optimizations
  if (request.nextUrl.pathname.startsWith('/api/')) {
    supabaseResponse.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
