/**
 * API Route Tests for Institution Staff
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/institution/staff/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Institution Staff API Routes', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        admin: {
          createUser: jest.fn(),
        },
      },
      from: jest.fn(),
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('GET should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/institution/staff');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('GET should return staff members', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const roleBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { institution_id: 'inst-1' } }),
    };

    const staffBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [{ id: 'role-1' }], error: null }),
    };

    mockSupabase.from
      .mockImplementationOnce(() => roleBuilder)
      .mockImplementationOnce(() => staffBuilder);

    const request = new NextRequest('http://localhost:3000/api/institution/staff');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
  });

  it('POST should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/institution/staff', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('POST should invite staff when admin and existing user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });

    const adminRoleBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { role: 'institution_admin' } }),
    };

    const existingUserBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'user-2' } }),
    };

    const existingRoleBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    };

    const insertRoleBuilder = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase.from
      .mockImplementationOnce(() => adminRoleBuilder)
      .mockImplementationOnce(() => existingUserBuilder)
      .mockImplementationOnce(() => existingRoleBuilder)
      .mockImplementationOnce(() => insertRoleBuilder);

    const request = new NextRequest('http://localhost:3000/api/institution/staff', {
      method: 'POST',
      body: JSON.stringify({
        email: 'staff@example.edu',
        name: 'Staff Member',
        role: 'institution_staff',
        institution_id: 'inst-1',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
