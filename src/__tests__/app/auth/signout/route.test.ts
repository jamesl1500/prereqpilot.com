import { POST } from '@/app/auth/signout/route';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Auth Signout Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs out and redirects', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    });

    await POST();

    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
