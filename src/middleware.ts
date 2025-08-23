import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Add all public routes here
const publicRoutes = ["/", "/auth/signin", "/auth/error"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth-related routes and callbacks
  if (pathname.startsWith('/api/auth') || pathname.includes('/callback')) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // If user is not authenticated and trying to access protected routes
    if (!token) {
      // Store the original URL as a callback
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/?callbackUrl=${callbackUrl}`, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of any error, redirect to the error page
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
