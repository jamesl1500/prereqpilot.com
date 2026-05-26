/**
 * Program by ID API Route
 * Handles update and delete operations for individual programs
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateProgram, deleteProgram } from '@/services/program-service';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';
import {
  getProgramRequirement,
  updateProgramRequirement,
  deleteProgramRequirement,
  getProgramWithDetails,
} from '@/services/program-requirement-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';
    const type = searchParams.get('type');

    if (type === 'requirement') {
      const result = includeDetails
        ? await getProgramWithDetails(id, request)
        : await getProgramRequirement(id, request);

      if (!result.success) {
        await logApiError({
          request,
          error: result.error,
          functionName: 'GET',
          payloadReceived: result,
        });
        return NextResponse.json(
          { error: result.error },
          { status: result.error === 'Unauthorized' ? 401 : 404 }
        );
      }

      return NextResponse.json({ data: result.data });
    }

    // Default to program (existing functionality can be added here if needed)
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'requirement') {
      const result = await updateProgramRequirement(id, body, request);
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
          { status: result.error === 'Unauthorized' ? 401 : 400 }
        );
      }
      return NextResponse.json({ success: true, data: result.data });
    }

    // Default to program
    const result = await updateProgram(id, user.id, body, request);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'requirement') {
      const result = await deleteProgramRequirement(id, request);
      if (!result.success) {
        await logApiError({
          request,
          error: result.error,
          functionName: 'DELETE',
          payloadReceived: result,
        });
        const status = result.error === 'Unauthorized'
          ? 401
          : result.error === 'Not found or not authorized'
            ? 403
            : 400;
        return NextResponse.json(
          { error: result.error },
          { status }
        );
      }
      return NextResponse.json({ success: true });
    }

    // Default to program
    const result = await deleteProgram(id, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'DELETE',
        payloadReceived: result,
      });
      const status = result.error === 'Unauthorized'
        ? 401
        : result.error === 'Not found or not authorized'
          ? 403
          : 400;
      return NextResponse.json(
        { error: result.error },
        { status }
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
