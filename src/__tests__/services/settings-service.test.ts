import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount,
  getUserProfile,
} from '@/services/settings-service';
import { createMockRequest } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Settings Service', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        updateUser: jest.fn(),
        signOut: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('updates user profile name and email', async () => {
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null });

    const result = await updateUserProfile(
      'user-1',
      { name: 'New Name', email: 'new@example.com' },
      mockRequest as any
    );

    expect(result).toEqual({ success: true });
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ email: 'new@example.com' });
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ data: { name: 'New Name' } });
  });

  it('returns error when password update cannot find user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await updateUserPassword(
      { currentPassword: 'old', newPassword: 'new' },
      mockRequest as any
    );

    expect(result).toEqual({ success: false, error: 'User not found' });
  });

  it('returns user profile', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          created_at: '2024-01-01',
          user_metadata: { name: 'Test User' },
        },
      },
      error: null,
    });

    const result = await getUserProfile(mockRequest as any);

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('test@example.com');
  });

  it('deletes user account by signing out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const result = await deleteUserAccount('user-1', mockRequest as any);

    expect(result).toEqual({ success: true });
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});
