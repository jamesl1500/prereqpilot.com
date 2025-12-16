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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getRequiredCourses(id, request);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === 'Unauthorized' ? 401 : 400 }
    );
  }

  return NextResponse.json(result.data);
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
      return NextResponse.json(
        { error: errorMessage },
        { status: errorMessage === 'Unauthorized' ? 401 : 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
