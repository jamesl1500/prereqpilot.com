/**
 * API Route Tests for Scenarios by ID
 */

import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/scenarios/[id]/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { updateScenario, deleteScenario } from '@/services/scenario-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/scenario-service');

describe('Scenarios by ID API Routes', () => {
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

  it('PUT should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'sc-1' }) });
    expect(response.status).toBe(401);
  });

  it('PUT should update scenario', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (updateScenario as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'sc-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('DELETE should remove scenario', async () => {
    (deleteScenario as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/scenarios/sc-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'sc-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
