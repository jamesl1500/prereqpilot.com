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

export async function GET(request: NextRequest) {
  const result = await getInstitutionCourses(request);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Unauthorized' ? 401 : 400 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createInstitutionCourse(body, request);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Unauthorized' ? 401 : 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
