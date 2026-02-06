/**
 * API Route Tests for Settings Account
 */

import { NextRequest } from 'next/server';
import { DELETE } from '@/app/api/settings/account/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { deleteUserAccount } from '@/services/settings-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/settings-service');

describe('Settings Account API Route', () => {
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

  it('DELETE should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/settings/account', { method: 'DELETE' });
    const response = await DELETE(request);

    expect(response.status).toBe(401);
  });

  it('DELETE should remove account', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (deleteUserAccount as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/settings/account', { method: 'DELETE' });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
