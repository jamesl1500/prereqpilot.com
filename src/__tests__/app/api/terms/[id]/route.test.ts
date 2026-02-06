import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/terms/[id]/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { updateTerm, deleteTerm } from '@/services/term-service';
import { logApiError } from '@/lib/error_logs';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/term-service');
jest.mock('@/lib/error_logs');

describe('Terms [id] API', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('PUT returns 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/terms/term-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Fall 2024' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'term-1' }) });
    expect(response.status).toBe(401);
  });

  it('PUT updates term and returns success', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (updateTerm as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/terms/term-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Fall 2024' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'term-1' }) });
    const data = await response.json();

    expect(updateTerm).toHaveBeenCalledWith('term-1', 'user-1', { name: 'Fall 2024' }, request);
    expect(data.success).toBe(true);
  });

  it('PUT returns 400 on service error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (updateTerm as jest.Mock).mockResolvedValue({ success: false, error: 'Invalid term' });

    const request = new NextRequest('http://localhost:3000/api/terms/term-1', {
      method: 'PUT',
      body: JSON.stringify({ name: '' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'term-1' }) });
    expect(response.status).toBe(400);
    expect(logApiError).toHaveBeenCalled();
  });

  it('DELETE removes term', async () => {
    (deleteTerm as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/terms/term-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'term-1' }) });
    const data = await response.json();

    expect(deleteTerm).toHaveBeenCalledWith('term-1', request);
    expect(data.success).toBe(true);
  });

  it('DELETE returns 400 on service error', async () => {
    (deleteTerm as jest.Mock).mockResolvedValue({ success: false, error: 'Not found' });

    const request = new NextRequest('http://localhost:3000/api/terms/term-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'term-1' }) });
    expect(response.status).toBe(400);
    expect(logApiError).toHaveBeenCalled();
  });
});
