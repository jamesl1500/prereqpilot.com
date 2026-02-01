/**
 * Institution Courses API Route
 * GET: Get all courses for institution
 * POST: Create a new course
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getInstitutionCourses,
  createInstitutionCourse,
} from '@/services/institution-course-service';
import { logApiError } from '@/lib/error_logs';

export async function GET(request: NextRequest) {
  try {
    const result = await getInstitutionCourses(request);

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createInstitutionCourse(body, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'POST',
        payloadSent: body,
        payloadReceived: result,
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Unauthorized' ? 401 : 400 }
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
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
