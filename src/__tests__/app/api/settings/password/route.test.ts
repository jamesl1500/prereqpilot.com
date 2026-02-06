/**
 * API Route Tests for Settings Password
 */

import { NextRequest } from 'next/server';
import { PUT } from '@/app/api/settings/password/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { updateUserPassword } from '@/services/settings-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/settings-service');

describe('Settings Password API Route', () => {
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

    const request = new NextRequest('http://localhost:3000/api/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'newpassword' }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(401);
  });

  it('PUT should return 400 when missing fields', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const request = new NextRequest('http://localhost:3000/api/settings/password', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });

  it('PUT should update password', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (updateUserPassword as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'newpassword' }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
