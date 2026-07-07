import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import type { Database } from '@/lib/database.types'

type Role = Database['public']['Enums']['user_role']

const ROLE_HOME: Record<Role, string> = {
  agent: '/browse',
  brokerage: '/candidates',
  admin: '/admin',
}

const ALWAYS_PUBLIC = [
  '/',
  '/privacy',
  '/auth/login',
  '/auth/signup',
  '/auth/reset',
  '/auth/update-password',
]

const AUTH_ENTRY_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset',
  '/auth/update-password',
  '/auth/complete-profile',
]

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The OAuth/email-confirmation code exchange happens inside this route
  // handler itself — nothing to gate here, and `user` below would be null
  // anyway since the exchange hasn't run yet.
  if (pathname === '/auth/callback') {
    return NextResponse.next({ request })
  }

  const { supabase, supabaseResponse, user } = await updateSession(request)

  if (!user) {
    if (ALWAYS_PUBLIC.includes(pathname)) {
      return supabaseResponse
    }
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Privacy notice stays reachable regardless of onboarding state.
  if (pathname === '/privacy') {
    return supabaseResponse
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, pdpl_consent_at')
    .eq('id', user.id)
    .maybeSingle()

  const profileComplete = Boolean(profile?.pdpl_consent_at)

  if (!profileComplete) {
    if (pathname === '/auth/complete-profile') {
      return supabaseResponse
    }
    const url = request.nextUrl.clone()
    url.pathname = '/auth/complete-profile'
    return NextResponse.redirect(url)
  }

  const role = profile!.role
  const home = ROLE_HOME[role]

  // Signed-in users with a finished profile don't need the landing page or
  // any auth entry point — send them to their role's home.
  if (pathname === '/' || AUTH_ENTRY_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }

  if (matchesPrefix(pathname, ['/admin']) && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }
  if (matchesPrefix(pathname, ['/browse', '/brokerage']) && role !== 'agent') {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }
  if (matchesPrefix(pathname, ['/candidates', '/agent']) && role !== 'brokerage') {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }
  if (pathname.startsWith('/onboarding/agent') && role !== 'agent') {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }
  if (pathname.startsWith('/onboarding/brokerage') && role !== 'brokerage') {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
