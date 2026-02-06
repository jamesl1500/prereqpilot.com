/**
 * API Route Tests for Program Import
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/programs/import/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Program Import API Route', () => {
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

  it('should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/programs/import', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.edu/programs/nursing' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 for missing url', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const request = new NextRequest('http://localhost:3000/api/programs/import', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('A valid URL is required.');
  });

  it('should return 400 for invalid url', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const request = new NextRequest('http://localhost:3000/api/programs/import', {
      method: 'POST',
      body: JSON.stringify({ url: 'not-a-url' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('URL is invalid.');
  });
});
