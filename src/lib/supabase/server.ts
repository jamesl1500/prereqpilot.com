import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in Server Components and Server Actions
 * This client handles cookie-based authentication for server-side operations
 */
export async function createClient() {
  const { cookies: getCookies } = await import('next/headers');
  const cookieStore = await getCookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for use in API Routes
 * This version accepts request object to read cookies from the header
 */
export function createRouteHandlerClient(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieHeader
            .split('; ')
            .filter(Boolean)
            .map((cookie) => {
              const [name, ...valueParts] = cookie.split('=');
              return {
                name: name.trim(),
                value: valueParts.join('='),
              };
            });
        },
        setAll() {
          // In API routes, we can't set cookies directly
          // They would need to be set in the response headers
          // For now, we'll skip this as authentication should already be established
        },
      },
    }
  );
}
