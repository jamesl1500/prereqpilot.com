import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingStatus, updateOnboardingStep, completeOnboarding } from '@/services/onboarding-service';
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

    const result = await getOnboardingStatus(user.id, request);

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

export async function PUT(request: NextRequest) {
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
    const { step, steps_completed, complete } = body;

    let result;
    if (complete) {
      result = await completeOnboarding(user.id, request);
    } else {
      result = await updateOnboardingStep(user.id, step, steps_completed, request);
    }

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'PUT',
        userId: user.id,
        payloadSent: body,
        payloadReceived: result,
      });
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'PUT',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
