/**
 * Institution by ID API Route
 * Handles update and delete operations for individual institutions
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateInstitution, deleteInstitution } from '@/services/institution-service';
import { logApiError } from '@/lib/error_logs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateInstitution(id, body, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'PUT',
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
    const result = await deleteInstitution(id, request);

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
