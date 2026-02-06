/**
 * API Route Tests for Institution Staff by ID
 */

import { NextRequest } from 'next/server';
import { DELETE, PUT } from '@/app/api/institution/staff/[id]/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Institution Staff by ID API Routes', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('DELETE should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/institution/staff/role-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'role-1' }) });
    expect(response.status).toBe(401);
  });

  it('DELETE should prevent deleting yourself', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const staffBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { user_id: 'user-1', institution_id: 'inst-1' } }),
    };

    mockSupabase.from.mockReturnValue(staffBuilder);

    const request = new NextRequest('http://localhost:3000/api/institution/staff/role-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'role-1' }) });
    expect(response.status).toBe(400);
  });

  it('PUT should return 400 when role missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const request = new NextRequest('http://localhost:3000/api/institution/staff/role-1', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'role-1' }) });
    expect(response.status).toBe(400);
  });

  it('PUT should update role when admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });

    const staffBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
        .mockResolvedValueOnce({ data: { user_id: 'user-2', institution_id: 'inst-1' } })
        .mockResolvedValueOnce({ data: { role: 'institution_admin' } }),
    };

    const updateBuilder = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase.from
      .mockImplementationOnce(() => staffBuilder)
      .mockImplementationOnce(() => staffBuilder)
      .mockImplementationOnce(() => updateBuilder);

    const request = new NextRequest('http://localhost:3000/api/institution/staff/role-1', {
      method: 'PUT',
      body: JSON.stringify({ role: 'institution_staff' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'role-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
