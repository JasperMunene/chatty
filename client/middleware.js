import { NextResponse } from 'next/server';


// Middleware to protect routes
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.get('chatty'); 

  if (!isAuthenticated && pathname === '/') {
    // Redirect unauthenticated users to the login page
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access for authenticated users
  return NextResponse.next();
}

// Define the protected routes
export const config = {
  matcher: ['/'], // Protect the home route ('/')
};
