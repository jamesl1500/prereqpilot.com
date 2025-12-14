/**
 * Program Course Mappings API Route
 * GET: Get all course mappings for a program
 * POST: Create or update a course mapping
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCourseMappings,
  createCourseMapping,
  updateCourseMapping,
} from '@/services/program-requirement-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getCourseMappings(id, request);

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
    
    // Try to update first, if not exists then create
    const updateResult = await updateCourseMapping(
      body.program_required_course_id,
      {
        taken_course_id: body.taken_course_id,
        is_completed: body.is_completed,
      },
      request
    );

    if (updateResult.success) {
      return NextResponse.json(updateResult.data);
    }

    // If update failed, create new mapping
    const createResult = await createCourseMapping(
      {
        program_requirement_id: id,
        program_required_course_id: body.program_required_course_id,
        taken_course_id: body.taken_course_id,
        is_completed: body.is_completed,
      },
      request
    );

    if (!createResult.success) {
      return NextResponse.json(
        { error: createResult.error },
        { status: createResult.error === 'Unauthorized' ? 401 : 400 }
      );
    }

    return NextResponse.json(createResult.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
