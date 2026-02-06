/**
 * API Route Tests for Program Required Courses
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/programs/[id]/courses/route';
import { getRequiredCourses, createRequiredCourse } from '@/services/program-requirement-service';

jest.mock('@/services/program-requirement-service');

describe('Program Required Courses API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET should return required courses', async () => {
    (getRequiredCourses as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: 'course-1' }],
    });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1/courses');
    const response = await GET(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('POST should create required course', async () => {
    (createRequiredCourse as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'req-course-1' },
    });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1/courses', {
      method: 'POST',
      body: JSON.stringify({ course_title: 'Biology' }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('POST should return 400 on invalid body', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;

    const response = await POST(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
  });
});
