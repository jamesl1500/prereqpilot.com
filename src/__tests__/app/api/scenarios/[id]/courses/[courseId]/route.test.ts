/**
 * API Route Tests for Scenario Course by ID
 */

import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/scenarios/[id]/courses/[courseId]/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Scenario Course by ID API Routes', () => {
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

  it('PUT should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1/courses/course-1', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'sc-1', courseId: 'course-1' }) });
    expect(response.status).toBe(401);
  });

  it('DELETE should remove scenario course', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const scenarioBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    };

    const deleteBuilder = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    mockSupabase.from
      .mockImplementationOnce(() => scenarioBuilder)
      .mockImplementationOnce(() => deleteBuilder);

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1/courses/course-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'sc-1', courseId: 'course-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
