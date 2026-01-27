import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PendingPage from '@/app/institution/pending/page';
import InstitutionSignup from '@/app/institution/signup/page';
import CoursesPageServer from '@/app/institution/(authenticated)/courses/page';
import ProgramsPageServer from '@/app/institution/(authenticated)/programs/page';
import DashboardPageServer from '@/app/institution/(authenticated)/dashboard/page';
import ProfilePageServer from '@/app/institution/(authenticated)/profile/page';
import SettingsPageServer from '@/app/institution/(authenticated)/settings/page';
import StaffPageServer from '@/app/institution/(authenticated)/staff/page';
import { cookies as nextCookies } from 'next/headers';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('Institution server pages', () => {
  const mockedCreateClient = createClient as jest.Mock;
  const mockedRedirect = redirect as jest.Mock;
  const mockedCookies = nextCookies as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCookies.mockResolvedValue({});
    mockedRedirect.mockImplementation((path: string) => {
      const err = new Error(path);
      err.name = 'NEXT_REDIRECT';
      throw err;
    });
  });

  const makeSupabase = (overrides: Partial<any> = {}) => ({
    auth: {
      getUser: jest.fn(),
      admin: {
        getUserById: jest.fn(),
      },
      ...overrides.auth,
    },
    from: jest.fn(),
    ...overrides,
  });

  it('pending page redirects to login when unauthenticated', async () => {
    const supabase = makeSupabase();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(PendingPage()).rejects.toThrow('/login');
  });

  it('pending page redirects to signup when no institution role', async () => {
    const supabase = makeSupabase();
    const user = { id: 'u1' };
    supabase.auth.getUser.mockResolvedValue({ data: { user } });
    const single = jest.fn().mockResolvedValue({ data: null });
    const eq = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single }) });
    const select = jest.fn().mockReturnValue({ eq });
    supabase.from.mockImplementation((table: string) => ({ select }));
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(PendingPage()).rejects.toThrow('/institution/signup');
  });

  it('signup page redirects to dashboard when admin role exists', async () => {
    const supabase = makeSupabase();
    const user = { id: 'u2' };
    supabase.auth.getUser.mockResolvedValue({ data: { user } });
    const single = jest.fn().mockResolvedValue({ data: { role: 'institution_admin' } });
    const eq = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single }) });
    const select = jest.fn().mockReturnValue({ eq });
    supabase.from.mockImplementation(() => ({ select }));
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(InstitutionSignup()).rejects.toThrow('/institution/dashboard');
  });

  it('signup page renders form when unauthenticated', async () => {
    const supabase = makeSupabase();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockedCreateClient.mockResolvedValue(supabase);

    const result = await InstitutionSignup();

    expect(result).toBeTruthy();
  });

  it('courses page redirects unauthenticated users', async () => {
    const supabase = makeSupabase();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(CoursesPageServer()).rejects.toThrow('/auth/login');
  });

  it('programs page redirects unauthenticated users', async () => {
    const supabase = makeSupabase();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(ProgramsPageServer()).rejects.toThrow('/login');
  });

  it('dashboard page redirects pending institutions', async () => {
    const supabase = makeSupabase();
    const user = { id: 'u3' };
    supabase.auth.getUser.mockResolvedValue({ data: { user } });
    const singleRole = jest.fn().mockResolvedValue({
      data: { role: 'institution_admin', institutions: { id: 'i1', status: 'pending' } },
    });
    const selectRole = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ or: jest.fn().mockReturnValue({ single: singleRole }) }),
    });
    supabase.from.mockImplementation(() => ({ select: selectRole }));
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(DashboardPageServer()).rejects.toThrow('/institution/pending');
  });

  it('profile page redirects unauthenticated users', async () => {
    const supabase = makeSupabase();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(ProfilePageServer()).rejects.toThrow('/auth/login');
  });

  it('settings page redirects unauthenticated users', async () => {
    const supabase = makeSupabase();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(SettingsPageServer()).rejects.toThrow('/auth/login');
  });

  it('staff page redirects non-admin roles', async () => {
    const supabase = makeSupabase();
    const user = { id: 'u4' };
    supabase.auth.getUser.mockResolvedValue({ data: { user } });
    const singleRole = jest.fn().mockResolvedValue({ data: null });
    const eq = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: singleRole }) });
    const select = jest.fn().mockReturnValue({ eq });
    supabase.from.mockImplementation(() => ({ select }));
    mockedCreateClient.mockResolvedValue(supabase);

    await expect(StaffPageServer()).rejects.toThrow('/institution/dashboard');
  });
});
