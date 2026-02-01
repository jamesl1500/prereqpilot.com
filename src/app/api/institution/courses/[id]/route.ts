/**
 * Institution Course API Route (Single)
 * GET: Get a single course
 * PUT: Update a course
 * DELETE: Delete a course
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getInstitutionCourse,
  updateInstitutionCourse,
  deleteInstitutionCourse,
} from '@/services/institution-course-service';
import { logApiError } from '@/lib/error_logs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getInstitutionCourse(id, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'GET',
        payloadReceived: result,
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Unauthorized' ? 401 : 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
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
  const { id } = await params;

  try {
    const body = await request.json();
    const result = await updateInstitutionCourse(id, body, request);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteInstitutionCourse(id, request);

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
