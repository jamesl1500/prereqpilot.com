/**
 * Programs API Route
 * Handles program CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProgram, getAllPrograms } from '@/services/program-service';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  getAllProgramRequirements,
  createProgramRequirement,
} from '@/services/program-requirement-service';

export async function GET(request: NextRequest) {
  try {
    // Check if requesting requirements or programs
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'requirements') {
      const result = await getAllProgramRequirements(request);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: result.error === 'Unauthorized' ? 401 : 500 }
        );
      }
      return NextResponse.json(result.data);
    }

    // Default to programs
    const result = await getAllPrograms(request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if creating a requirement or program
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'requirement') {
      const result = await createProgramRequirement(body, request);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: result.error === 'Unauthorized' ? 401 : 400 }
        );
      }
      return NextResponse.json(result.data, { status: 201 });
    }

    // Default to program
    const result = await createProgram(user.id, body, request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
