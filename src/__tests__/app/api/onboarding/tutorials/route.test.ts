/**
 * API Route Tests for Onboarding Tutorials
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/onboarding/tutorials/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getTutorialProgress, markTutorialComplete } from '@/services/onboarding-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/onboarding-service');

describe('Onboarding Tutorials API Routes', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('GET should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/onboarding/tutorials');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('GET should return tutorial progress', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (getTutorialProgress as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ tutorial_type: 'institutions' }],
    });

    const request = new NextRequest('http://localhost:3000/api/onboarding/tutorials');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it('POST should mark tutorial complete', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (markTutorialComplete as jest.Mock).mockResolvedValue({ success: true, data: {} });

    const request = new NextRequest('http://localhost:3000/api/onboarding/tutorials', {
      method: 'POST',
      body: JSON.stringify({ tutorial_type: 'institutions', skipped: false }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
