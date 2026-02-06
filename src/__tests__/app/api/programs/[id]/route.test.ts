/**
 * API Route Tests for Programs by ID
 */

import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/programs/[id]/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { updateProgram, deleteProgram } from '@/services/program-service';
import {
  getProgramRequirement,
  getProgramWithDetails,
  updateProgramRequirement,
  deleteProgramRequirement,
} from '@/services/program-requirement-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/program-service');
jest.mock('@/services/program-requirement-service');

describe('Programs by ID API Routes', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('GET should return requirement details', async () => {
    (getProgramRequirement as jest.Mock).mockResolvedValue({ success: true, data: { id: 'prog-1' } });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1?type=requirement');
    const response = await GET(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('prog-1');
  });

  it('GET should return details when requested', async () => {
    (getProgramWithDetails as jest.Mock).mockResolvedValue({ success: true, data: { id: 'prog-1' } });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1?type=requirement&details=true');
    const response = await GET(request, { params: Promise.resolve({ id: 'prog-1' }) });

    expect(response.status).toBe(200);
  });

  it('GET should return 501 for unsupported type', async () => {
    const request = new NextRequest('http://localhost:3000/api/programs/prog-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'prog-1' }) });

    expect(response.status).toBe(501);
  });

  it('PUT should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'prog-1' }) });
    expect(response.status).toBe(401);
  });

  it('PUT should update requirement when type=requirement', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (updateProgramRequirement as jest.Mock).mockResolvedValue({ success: true, data: { id: 'req-1' } });

    const request = new NextRequest('http://localhost:3000/api/programs/req-1?type=requirement', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'req-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('req-1');
  });

  it('DELETE should delete requirement when type=requirement', async () => {
    (deleteProgramRequirement as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/programs/req-1?type=requirement', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'req-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('DELETE should delete program by default', async () => {
    (deleteProgram as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
