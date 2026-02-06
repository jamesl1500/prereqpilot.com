import { GET } from '@/app/auth/callback/route';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: string) => new Response(null, { status: 302, headers: { location: url } }),
  },
}));

describe('Auth Callback Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to verified on code exchange success', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
        verifyOtp: jest.fn(),
      },
    });

    const request = new Request('http://localhost:3000/auth/callback?code=abc');
    const response = await GET(request);

    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/verified');
  });

  it('redirects recovery to reset-password', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        exchangeCodeForSession: jest.fn(),
        verifyOtp: jest.fn().mockResolvedValue({ error: null }),
      },
    });

    const request = new Request('http://localhost:3000/auth/callback?token_hash=hash&type=recovery');
    const response = await GET(request);

    expect(response.headers.get('location')).toBe('http://localhost:3000/reset-password');
  });

  it('redirects to error on verification failure', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({ error: new Error('Bad code') }),
        verifyOtp: jest.fn(),
      },
    });

    const request = new Request('http://localhost:3000/auth/callback?code=bad');
    const response = await GET(request);

    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error');
  });
});
