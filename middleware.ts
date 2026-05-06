import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Auth is checked in the dashboard client layout because this app stores the
  // Supabase session in browser storage, not in a Next.js-readable auth cookie.
  void pathname

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)', '/dashboard/:path*'],
}
