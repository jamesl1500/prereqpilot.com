/**
 * Program Required Course API Route (Single)
 * PUT: Update a required course
 * DELETE: Delete a required course
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateRequiredCourse,
  deleteRequiredCourse,
} from '@/services/program-requirement-service';
import { logApiError } from '@/lib/error_logs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const body = await request.json();
    const result = await updateRequiredCourse(courseId, body, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'PUT',
        payloadSent: body,
        payloadReceived: result,
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Unauthorized' ? 401 : 400 }
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
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const result = await deleteRequiredCourse(courseId, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'DELETE',
        payloadReceived: result,
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Unauthorized' ? 401 : 400 }
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
