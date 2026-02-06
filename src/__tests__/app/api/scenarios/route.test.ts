/**
 * API Route Tests for Scenarios
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/scenarios/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getUserScenarios, createScenario } from '@/services/scenario-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/scenario-service');

describe('Scenarios API Routes', () => {
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

    const request = new NextRequest('http://localhost:3000/api/scenarios');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('GET should return scenarios', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (getUserScenarios as jest.Mock).mockResolvedValue({ success: true, data: [{ id: 'sc-1' }] });

    const request = new NextRequest('http://localhost:3000/api/scenarios');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it('POST should create scenario', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (createScenario as jest.Mock).mockResolvedValue({ success: true, data: {} });

    const request = new NextRequest('http://localhost:3000/api/scenarios', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', program_id: 'prog-1' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
