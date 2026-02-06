/**
 * API Route Tests for Institution Courses
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/institution/courses/route';
import { getInstitutionCourses, createInstitutionCourse } from '@/services/institution-course-service';

jest.mock('@/services/institution-course-service');

describe('Institution Courses API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/institution/courses', () => {
    it('should return institution courses', async () => {
      (getInstitutionCourses as jest.Mock).mockResolvedValue({
        success: true,
        data: [{ id: 'course-1' }],
      });

      const request = new NextRequest('http://localhost:3000/api/institution/courses');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });

    it('should return 401 when unauthorized', async () => {
      (getInstitutionCourses as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost:3000/api/institution/courses');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/institution/courses', () => {
    it('should create a course', async () => {
      (createInstitutionCourse as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'course-1' },
      });

      const request = new NextRequest('http://localhost:3000/api/institution/courses', {
        method: 'POST',
        body: JSON.stringify({ course_title: 'Biology' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should return 400 for invalid body', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });
  });
});
