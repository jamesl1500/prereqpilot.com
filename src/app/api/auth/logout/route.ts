/**
 * Logout API Route
 * Handles user sign out by clearing the Supabase session
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logApiError } from '@/lib/error_logs';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      await logApiError({
        request,
        error,
        functionName: 'POST',
      });
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Redirect to home page after successful logout
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'POST',
    });
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Support GET requests as well for direct navigation
  return POST(request);
}
