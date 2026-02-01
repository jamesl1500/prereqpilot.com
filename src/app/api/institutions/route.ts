/**
 * Institutions API Route
 * Handles institution CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInstitution, getAllInstitutions } from '@/services/institution-service';
import { logApiError } from '@/lib/error_logs';

export async function GET(request: NextRequest) {
  try {
    const result = await getAllInstitutions(request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'GET',
        payloadReceived: result,
      });
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
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
    const result = await createInstitution(body, request);

    if (!result.success) {
      await logApiError({
        request,
        error: result.error,
        functionName: 'POST',
        payloadSent: body,
        payloadReceived: result,
      });
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
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
