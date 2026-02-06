/**
 * API Route Tests for Institution Register
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/institution/register/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Institution Register API Route', () => {
  let mockSupabase: any;
  let institutionBuilder: any;
  let userRolesBuilder: any;

  beforeEach(() => {
    jest.clearAllMocks();

    institutionBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
    };

    userRolesBuilder = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase = {
      from: jest.fn((table: string) => {
        if (table === 'institutions') return institutionBuilder;
        if (table === 'user_roles') return userRolesBuilder;
        return institutionBuilder;
      }),
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        admin: {
          deleteUser: jest.fn(),
        },
      },
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('should return 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/institution/register', {
      method: 'POST',
      body: JSON.stringify({ institutionName: 'Test' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for mismatched domains', async () => {
    const request = new NextRequest('http://localhost:3000/api/institution/register', {
      method: 'POST',
      body: JSON.stringify({
        institutionName: 'Test University',
        domain: 'example.edu',
        contactEmail: 'contact@other.edu',
        adminName: 'Admin',
        adminEmail: 'admin@other.edu',
        adminPassword: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 409 if domain already registered', async () => {
    institutionBuilder.single.mockResolvedValue({ data: { id: 'inst-1' }, error: null });

    const request = new NextRequest('http://localhost:3000/api/institution/register', {
      method: 'POST',
      body: JSON.stringify({
        institutionName: 'Test University',
        domain: 'example.edu',
        contactEmail: 'contact@example.edu',
        adminName: 'Admin',
        adminEmail: 'admin@example.edu',
        adminPassword: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it('should handle auth signup errors', async () => {
    institutionBuilder.single.mockResolvedValue({ data: null, error: null });
    mockSupabase.auth.signUp.mockResolvedValue({ data: {}, error: { message: 'Signup failed' } });

    const request = new NextRequest('http://localhost:3000/api/institution/register', {
      method: 'POST',
      body: JSON.stringify({
        institutionName: 'Test University',
        domain: 'example.edu',
        contactEmail: 'contact@example.edu',
        adminName: 'Admin',
        adminEmail: 'admin@example.edu',
        adminPassword: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should register institution successfully', async () => {
    institutionBuilder.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { id: 'inst-1' }, error: null });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });

    const request = new NextRequest('http://localhost:3000/api/institution/register', {
      method: 'POST',
      body: JSON.stringify({
        institutionName: 'Test University',
        domain: 'example.edu',
        contactEmail: 'contact@example.edu',
        adminName: 'Admin',
        adminEmail: 'admin@example.edu',
        adminPassword: 'password123',
        website: 'https://example.edu',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
