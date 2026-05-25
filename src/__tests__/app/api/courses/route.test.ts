/**
 * Unit tests for Courses API Routes
 */

import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/courses/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getUserCourses, createCourse } from '@/services/course-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/course-service');

describe('Courses API Routes', () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost:3000/api/courses');
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('GET /api/courses', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return user courses when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockCourses = [
        {
          id: 'course-1',
          course_title: 'Math 101',
          credits: 3,
          grade: 'A',
          grade_value: 4.0,
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (getUserCourses as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCourses,
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockCourses);
      expect(getUserCourses).toHaveBeenCalledWith(mockUser.id, mockRequest);
    });

    it('should handle service errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (getUserCourses as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/courses', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should create a course when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const courseData = {
        course_title: 'Math 101',
        credits: 3,
        grade: 'A',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (createCourse as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'course-1', ...courseData },
      });

      // Mock request.json()
      jest.spyOn(mockRequest, 'json').mockResolvedValue(courseData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(createCourse).toHaveBeenCalledWith(mockUser.id, courseData, mockRequest);
    });

    it('should handle validation errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const invalidData = { course_title: '' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (createCourse as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Course title is required',
      });

      jest.spyOn(mockRequest, 'json').mockResolvedValue(invalidData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Course title is required');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('DELETE /api/courses', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const req = new NextRequest('http://localhost:3000/api/courses', { method: 'DELETE' });
      jest.spyOn(req, 'json').mockResolvedValue({ ids: ['course-1'] });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when ids is missing', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const req = new NextRequest('http://localhost:3000/api/courses', { method: 'DELETE' });
      jest.spyOn(req, 'json').mockResolvedValue({});

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ids array is required');
    });

    it('should return 400 when ids is an empty array', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const req = new NextRequest('http://localhost:3000/api/courses', { method: 'DELETE' });
      jest.spyOn(req, 'json').mockResolvedValue({ ids: [] });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ids array is required');
    });

    it('should return 400 when ids exceeds 100 items', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const req = new NextRequest('http://localhost:3000/api/courses', { method: 'DELETE' });
      jest.spyOn(req, 'json').mockResolvedValue({ ids: Array.from({ length: 101 }, (_, i) => `course-${i}`) });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot delete more than 100 courses at once');
    });

    it('should delete courses and return success', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const mockFrom = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from = jest.fn().mockReturnValue(mockFrom);

      const req = new NextRequest('http://localhost:3000/api/courses', { method: 'DELETE' });
      jest.spyOn(req, 'json').mockResolvedValue({ ids: ['course-1', 'course-2'] });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockFrom.in).toHaveBeenCalledWith('id', ['course-1', 'course-2']);
    });

    it('should return 500 when supabase delete fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const mockFrom = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      };
      mockSupabase.from = jest.fn().mockReturnValue(mockFrom);

      const req = new NextRequest('http://localhost:3000/api/courses', { method: 'DELETE' });
      jest.spyOn(req, 'json').mockResolvedValue({ ids: ['course-1'] });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('DB error');
    });

    it('should return 500 on unexpected error', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const req = new NextRequest('http://localhost:3000/api/courses', { method: 'DELETE' });
      jest.spyOn(req, 'json').mockResolvedValue({ ids: ['course-1'] });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
