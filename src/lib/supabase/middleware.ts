import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Creates a Supabase client for use in Middleware
 * This ensures auth cookies are properly managed for protected routes
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user role from metadata
  const userRole = user?.user_metadata?.role;

  // Protected routes check
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/about') &&
    !request.nextUrl.pathname.startsWith('/contact') &&
    !request.nextUrl.pathname.startsWith('/help') &&
    !request.nextUrl.pathname.startsWith('/privacy') &&
    !request.nextUrl.pathname.startsWith('/terms') &&
    !request.nextUrl.pathname.startsWith('/forinstitutions') &&
    request.nextUrl.pathname !== '/'
  ) {
    // No user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Role-based access control for institution admins
  if (user && userRole === 'institution_admin') {
    const path = request.nextUrl.pathname;
    
    // Student-only pages that institution admins cannot access
    const studentOnlyPages = [
      '/dashboard',
      '/settings',
      '/classes',
      '/programs',
      '/scenarios',
      '/transcript',
      '/browse-programs',
      '/institutions'
    ];
    
    // Check if trying to access a student-only page
    const isAccessingStudentPage = studentOnlyPages.some(page => path.startsWith(page));
    
    if (isAccessingStudentPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/institution/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Role-based access control for students (prevent access to institution pages)
  if (user && userRole !== 'institution_admin') {
    const path = request.nextUrl.pathname;
    
    // Institution-only pages that students cannot access
    const isInstitutionAdminArea = path === '/institution' || path.startsWith('/institution/');
    if (isInstitutionAdminArea) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // If user is authenticated and trying to access login/signup, redirect based on role
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
     request.nextUrl.pathname.startsWith('/signup') ||
     request.nextUrl.pathname.startsWith('/forgot-password'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = userRole === 'institution_admin' ? '/institution/dashboard' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so: NextResponse.next({ request })
  // 2. Copy over the cookies, like so: supabaseResponse.cookies.getAll().forEach(...)
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  return supabaseResponse;
}
