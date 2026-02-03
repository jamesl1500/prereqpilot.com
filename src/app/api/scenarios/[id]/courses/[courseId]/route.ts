/**
 * Scenario Course API Route (Individual Course)
 * Handles update and delete operations for specific scenario courses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  try {
    const { id: scenarioId, courseId } = await params;
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      simulatedGrade, 
      simulatedGradeValue, 
      simulatedCourseTitle,
      simulatedCredits,
    } = body;

    // Verify scenario belongs to user
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('user_id')
      .eq('id', scenarioId)
      .single();

    if (scenarioError || scenario?.user_id !== user.id) {
      await logApiError({
        request,
        error: scenarioError ?? 'Scenario not found',
        functionName: 'PUT',
        userId: user.id,
        payloadSent: body,
      });
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Update the scenario course
    const { data, error } = await supabase
      .from('scenario_taken_courses')
      .update({
        simulated_grade: simulatedGrade,
        simulated_grade_value: simulatedGradeValue,
        simulated_course_title: simulatedCourseTitle || null,
        simulated_credits: simulatedCredits || null,
      })
      .eq('id', courseId)
      .eq('scenario_id', scenarioId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
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
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  try {
    const { id: scenarioId, courseId } = await params;
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify scenario belongs to user
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('user_id')
      .eq('id', scenarioId)
      .single();

    if (scenarioError || scenario?.user_id !== user.id) {
      await logApiError({
        request,
        error: scenarioError ?? 'Scenario not found',
        functionName: 'DELETE',
        userId: user.id,
        payloadReceived: { scenarioId, courseId },
      });
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Delete the scenario course
    const { error } = await supabase
      .from('scenario_taken_courses')
      .delete()
      .eq('id', courseId)
      .eq('scenario_id', scenarioId);

    if (error) throw error;

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
