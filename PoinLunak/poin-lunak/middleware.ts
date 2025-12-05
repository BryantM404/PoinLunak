// Middleware for authentication and authorization

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Admin routes that require admin role
  const isAdminRoute = pathname.startsWith('/admin');

  // Member routes that require member role
  const isMemberRoute = pathname.startsWith('/member');

  // If no token and trying to access protected route
  if (!token && (isAdminRoute || isMemberRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token, verify it
  if (token) {
    const payload = await verifyToken(token.value);

    // Invalid token - redirect to login
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    const userRole = payload.role as string | null;

    // Prevent members from accessing admin routes
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/member/dashboard', request.url));
    }

    // Prevent admins from accessing member routes (optional - remove if admins should access both)
    if (isMemberRoute && userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Redirect authenticated users away from login/register pages
    if (isPublicRoute && pathname !== '/') {
      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/member/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
