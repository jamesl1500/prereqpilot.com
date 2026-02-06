/**
 * API Route Tests for Institution Course by ID
 */

import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/institution/courses/[id]/route';
import {
  getInstitutionCourse,
  updateInstitutionCourse,
  deleteInstitutionCourse,
} from '@/services/institution-course-service';

jest.mock('@/services/institution-course-service');

describe('Institution Course by ID API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET should return a course', async () => {
    (getInstitutionCourse as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'course-1' },
    });

    const request = new NextRequest('http://localhost:3000/api/institution/courses/course-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'course-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('PUT should update a course', async () => {
    (updateInstitutionCourse as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'course-1' },
    });

    const request = new NextRequest('http://localhost:3000/api/institution/courses/course-1', {
      method: 'PUT',
      body: JSON.stringify({ course_title: 'Updated' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'course-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('DELETE should remove a course', async () => {
    (deleteInstitutionCourse as jest.Mock).mockResolvedValue({
      success: true,
    });

    const request = new NextRequest('http://localhost:3000/api/institution/courses/course-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'course-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
