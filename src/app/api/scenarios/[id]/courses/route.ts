/**
 * Scenario Courses API Route
 * Handles scenario course simulations (retakes and hypothetical courses)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scenarioId } = await params;
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { takenCourseId, simulatedGrade, simulatedGradeValue, isRepeat } = body;

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
        functionName: 'POST',
        userId: user.id,
        payloadSent: body,
      });
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Check if simulation already exists
    const { data: existing } = await supabase
      .from('scenario_taken_courses')
      .select('id')
      .eq('scenario_id', scenarioId)
      .eq('taken_course_id', takenCourseId)
      .single();

    let result;
    if (existing) {
      // Update existing simulation
      result = await supabase
        .from('scenario_taken_courses')
        .update({
          simulated_grade: simulatedGrade,
          simulated_grade_value: simulatedGradeValue,
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new simulation
      result = await supabase
        .from('scenario_taken_courses')
        .insert([{
          scenario_id: scenarioId,
          taken_course_id: takenCourseId,
          simulated_grade: simulatedGrade,
          simulated_grade_value: simulatedGradeValue,
        }])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    // If marking as repeat, update the taken_course
    if (isRepeat && takenCourseId) {
      await supabase
        .from('taken_courses')
        .update({ is_retaken: true })
        .eq('id', takenCourseId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'POST',
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
    const { id: scenarioId } = await params;
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const takenCourseId = searchParams.get('takenCourseId');

    if (!takenCourseId) {
      return NextResponse.json(
        { error: 'Missing takenCourseId' },
        { status: 400 }
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
        payloadReceived: { scenarioId, takenCourseId },
      });
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('scenario_taken_courses')
      .delete()
      .eq('scenario_id', scenarioId)
      .eq('taken_course_id', takenCourseId);

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
