/**
 * Program Required Courses API Route
 * GET: Get all required courses for a program
 * POST: Create a new required course
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getRequiredCourses,
  createRequiredCourse,
} from '@/services/program-requirement-service';
import { logApiError } from '@/lib/error_logs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getRequiredCourses(id, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'GET',
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
      functionName: 'GET',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const result = await createRequiredCourse(
      { ...body, program_requirement_id: id },
      request
    );

    if (!result.success) {
      const errorMessage = 'error' in result ? result.error : 'An error occurred';
      await logApiError({
        request,
        error: errorMessage,
        functionName: 'POST',
        payloadSent: body,
        payloadReceived: result,
      });
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage === 'Unauthorized' ? 401 : 400 }
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
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
