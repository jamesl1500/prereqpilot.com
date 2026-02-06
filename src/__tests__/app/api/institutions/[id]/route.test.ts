/**
 * API Route Tests for Institutions by ID
 */

import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/institutions/[id]/route';
import { updateInstitution, deleteInstitution } from '@/services/institution-service';

jest.mock('@/services/institution-service');

describe('Institutions by ID API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT should update institution', async () => {
    (updateInstitution as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/institutions/inst-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'inst-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('DELETE should delete institution', async () => {
    (deleteInstitution as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/institutions/inst-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'inst-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
