/**
 * Unit tests for Auth Logout API Route
 */

import { POST, GET } from '@/app/api/auth/logout/route';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Auth Logout API Route', () => {
  const mockedCreateClient = createClient as jest.Mock;
  const siteUrl = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  });

  it('redirects after successful sign out', async () => {
    const mockSupabase = {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    };
    mockedCreateClient.mockResolvedValue(mockSupabase);

    const response = await POST();

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(response.status).toBe(307);
  });

  it('returns 400 when sign out returns an error', async () => {
    const mockSupabase = {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: { message: 'Sign out failed' } }),
      },
    };
    mockedCreateClient.mockResolvedValue(mockSupabase);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Sign out failed');
  });

  it('returns 500 on unexpected errors', async () => {
    mockedCreateClient.mockRejectedValue(new Error('Unexpected failure'));

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to sign out');
  });

  it('GET delegates to POST', async () => {
    const mockSupabase = {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    };
    mockedCreateClient.mockResolvedValue(mockSupabase);

    const response = await GET();

    expect(response.status).toBe(307);
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});
