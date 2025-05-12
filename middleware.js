import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the current path
  const path = req.nextUrl.pathname;
  
  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Public pages that don't require auth
  const publicPages = ['/', '/login', '/signup', '/reset-password', '/about', '/pricing'];
  
  // Protected pages that require authentication
  const protectedPages = ['/dashboard', '/jobs/create', '/jobs/my', '/profile', '/onboarding'];
  
  // Check if the current path is protected and user is not authenticated
  const isProtectedRoute = protectedPages.some(route => path.startsWith(route));
  const isPublicRoute = publicPages.some(route => path === route);
  
  // If the user is not authenticated and trying to access a protected page
  if (!session && isProtectedRoute) {
    // Redirect to login
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('next', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If user is authenticated but visiting login/signup pages
  if (session && (path === '/login' || path === '/signup')) {
    // Don't immediately redirect to onboarding - we want the login flow to be controlled by the login component
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return res;
}

// Define routes that trigger the middleware
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next internal routes
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
}; 