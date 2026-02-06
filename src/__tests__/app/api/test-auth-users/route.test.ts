import { GET } from '@/app/api/test-auth-users/route';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';

jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(),
}));
jest.mock('@/lib/error_logs');

describe('Test Auth Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns users with count', async () => {
    const limit = jest.fn().mockResolvedValue({
      data: [{ id: 'u1', email: 'a@example.com' }],
      error: null,
    });
    const select = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ select });

    (createServiceRoleClient as jest.Mock).mockReturnValue({ from });

    const response = await GET(new Request('http://localhost:3000/api/test-auth-users'));
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
  });

  it('returns 400 on query error', async () => {
    const limit = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Query failed' },
    });
    const select = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ select });

    (createServiceRoleClient as jest.Mock).mockReturnValue({ from });

    const response = await GET(new Request('http://localhost:3000/api/test-auth-users'));
    expect(response.status).toBe(400);
    expect(logApiError).toHaveBeenCalled();
  });

  it('returns 500 on exception', async () => {
    (createServiceRoleClient as jest.Mock).mockImplementation(() => {
      throw new Error('Boom');
    });

    const response = await GET(new Request('http://localhost:3000/api/test-auth-users'));
    expect(response.status).toBe(500);
  });
});
