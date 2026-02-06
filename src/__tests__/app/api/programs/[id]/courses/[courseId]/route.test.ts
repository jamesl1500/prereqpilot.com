/**
 * API Route Tests for Program Required Course by ID
 */

import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/programs/[id]/courses/[courseId]/route';
import { updateRequiredCourse, deleteRequiredCourse } from '@/services/program-requirement-service';

jest.mock('@/services/program-requirement-service');

describe('Program Required Course by ID API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT should update required course', async () => {
    (updateRequiredCourse as jest.Mock).mockResolvedValue({ success: true, data: { id: 'course-1' } });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1/courses/course-1', {
      method: 'PUT',
      body: JSON.stringify({ min_grade: 'B' }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'prog-1', courseId: 'course-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('DELETE should remove required course', async () => {
    (deleteRequiredCourse as jest.Mock).mockResolvedValue({ success: true });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1/courses/course-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'prog-1', courseId: 'course-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
