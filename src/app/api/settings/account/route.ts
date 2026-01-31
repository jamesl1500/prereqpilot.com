/**
 * Settings Account API Route
 * Handles account deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { deleteUserAccount } from '@/services/settings-service';
import { logApiError } from '@/lib/error_logs';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await deleteUserAccount(user.id, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'DELETE',
        userId: user.id,
        payloadReceived: result,
      });
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'DELETE',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
