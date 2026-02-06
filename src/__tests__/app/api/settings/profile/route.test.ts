/**
 * API Route Tests for Settings Profile
 */

import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/settings/profile/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getUserProfile, updateUserProfile } from '@/services/settings-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/settings-service');

describe('Settings Profile API Route', () => {
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

    const request = new NextRequest('http://localhost:3000/api/settings/profile');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('GET should return profile', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (getUserProfile as jest.Mock).mockResolvedValue({ success: true, data: { id: 'user-1' } });

    const request = new NextRequest('http://localhost:3000/api/settings/profile');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('PUT should update profile', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (updateUserProfile as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/settings/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
