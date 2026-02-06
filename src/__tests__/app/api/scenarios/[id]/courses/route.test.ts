/**
 * API Route Tests for Scenario Courses
 */

import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/scenarios/[id]/courses/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Scenario Courses API Routes', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('POST should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1/courses', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'sc-1' }) });
    expect(response.status).toBe(401);
  });

  it('DELETE should return 400 when missing takenCourseId', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1/courses', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'sc-1' }) });
    expect(response.status).toBe(400);
  });

  it('POST should create simulation when scenario belongs to user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const scenarioBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    };

    const existingBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    };

    const insertBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'sim-1' }, error: null }),
    };

    mockSupabase.from
      .mockImplementationOnce(() => scenarioBuilder)
      .mockImplementationOnce(() => existingBuilder)
      .mockImplementationOnce(() => insertBuilder);

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1/courses', {
      method: 'POST',
      body: JSON.stringify({
        takenCourseId: 'course-1',
        simulatedGrade: 'A',
        simulatedGradeValue: 4,
      }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'sc-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
