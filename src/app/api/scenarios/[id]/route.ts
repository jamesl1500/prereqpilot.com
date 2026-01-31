/**
 * Scenario by ID API Route
 * Handles update and delete operations for individual scenarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateScenario, deleteScenario } from '@/services/scenario-service';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await updateScenario(id, user.id, body, request);

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

    return NextResponse.json({ success: true });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteScenario(id, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'DELETE',
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
