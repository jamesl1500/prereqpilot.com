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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const body = await request.json();
    const result = await updateRequiredCourse(courseId, body, request);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Unauthorized' ? 401 : 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch {
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
  const { courseId } = await params;
  const result = await deleteRequiredCourse(courseId, request);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === 'Unauthorized' ? 401 : 400 }
    );
  }

  return NextResponse.json({ success: true });
}
