import { NextRequest, NextResponse } from 'next/server';
import { getTutorialProgress, markTutorialComplete } from '@/services/onboarding-service';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getTutorialProgress(user.id, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'GET',
        userId: user.id,
        payloadReceived: result,
      });
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'GET',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tutorial_type, skipped } = body;

    const result = await markTutorialComplete(user.id, tutorial_type, skipped || false, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'POST',
        userId: user.id,
        payloadSent: body,
        payloadReceived: result,
      });
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'POST',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
