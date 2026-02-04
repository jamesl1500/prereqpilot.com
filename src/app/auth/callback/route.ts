import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const next = searchParams.get('next') ?? '/auth/verified';
  const type = searchParams.get('type');

  const supabase = await createClient();

  let authError: Error | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error ?? null;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
      token_hash: tokenHash,
    });
    authError = error ?? null;
  } else {
    console.warn('[auth-callback] Missing verification parameters', {
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      type,
      next,
    });
  }

  if (!authError) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    // Determine redirect URL based on type (email confirmation or password reset)
    let redirectPath = next;

    if (type === 'recovery' || next.includes('reset-password')) {
      redirectPath = '/reset-password';
    }

    if (isLocalEnv) {
      // In development, redirect to localhost
      return NextResponse.redirect(`${origin}${redirectPath}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
    } else {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  if (authError) {
    console.error('[auth-callback] Verification failed', {
      message: authError.message,
      code: (authError as { code?: string }).code,
      type,
      next,
    });
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`);
}
