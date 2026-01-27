import React from 'react';
import EmailVerifiedPage from '@/app/auth/verified/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VerifiedPage from '@/app/auth/verified/VerifiedPage';
import type { User } from '@supabase/supabase-js';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
jest.mock('@/app/auth/verified/VerifiedPage', () => jest.fn(() => <div>Verified component mock</div>));

describe('EmailVerifiedPage (server)', () => {
  const mockedCreateClient = createClient as jest.Mock;
  const mockedRedirect = redirect as jest.Mock;
  const MockedVerifiedPage = VerifiedPage as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when unauthenticated', async () => {
    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const result = await EmailVerifiedPage();

    expect(mockedRedirect).toHaveBeenCalledWith('/login');
    expect(result).toBeDefined();
  });

  it('renders VerifiedPage when user is present', async () => {
    const user: User = {
      id: 'user-456',
      email: 'auth@example.com',
      created_at: '2024-02-01T00:00:00Z',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      confirmed_at: '2024-02-01T00:00:00Z',
      role: 'authenticated',
    };

    const getUser = jest.fn().mockResolvedValue({ data: { user }, error: null });
    mockedCreateClient.mockResolvedValue({ auth: { getUser } });

    const result = await EmailVerifiedPage();

    expect(result).toBeTruthy();
    expect((result as any).type).toBe(VerifiedPage);
    expect((result as any).props).toEqual({ user });
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});
