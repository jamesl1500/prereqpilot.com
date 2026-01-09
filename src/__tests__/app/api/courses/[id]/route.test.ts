/**
 * Unit tests for Course [id] API Routes (PUT/DELETE)
 */

import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/courses/[id]/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { updateCourse, deleteCourse } from '@/services/course-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/course-service');

describe('Course [id] API Routes', () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost:3000/api/courses/course-123');
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('PUT /api/courses/[id]', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const params = Promise.resolve({ id: 'course-123' });
      const response = await PUT(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should update a course when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const updateData = {
        credits: 4,
        grade: 'A+',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (updateCourse as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'course-123', ...updateData },
      });

      jest.spyOn(mockRequest, 'json').mockResolvedValue(updateData);

      const params = Promise.resolve({ id: 'course-123' });
      const response = await PUT(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(updateCourse).toHaveBeenCalledWith('course-123', mockUser.id, updateData, mockRequest);
    });

    it('should handle update errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (updateCourse as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Course not found',
      });

      jest.spyOn(mockRequest, 'json').mockResolvedValue({ credits: 4 });

      const params = Promise.resolve({ id: 'course-123' });
      const response = await PUT(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Course not found');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const params = Promise.resolve({ id: 'course-123' });
      const response = await PUT(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('DELETE /api/courses/[id]', () => {
    it('should delete a course successfully', async () => {
      (deleteCourse as jest.Mock).mockResolvedValue({
        success: true,
      });

      const params = Promise.resolve({ id: 'course-123' });
      const response = await DELETE(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(deleteCourse).toHaveBeenCalledWith('course-123', mockRequest);
    });

    it('should handle delete errors', async () => {
      (deleteCourse as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Course not found',
      });

      const params = Promise.resolve({ id: 'course-123' });
      const response = await DELETE(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Course not found');
    });

    it('should handle unexpected errors', async () => {
      (deleteCourse as jest.Mock).mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: 'course-123' });
      const response = await DELETE(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle different course IDs', async () => {
      (deleteCourse as jest.Mock).mockResolvedValue({
        success: true,
      });

      const courseIds = ['abc-123', 'xyz-789', 'test-course-id'];

      for (const courseId of courseIds) {
        const params = Promise.resolve({ id: courseId });
        await DELETE(mockRequest, { params });
        
        expect(deleteCourse).toHaveBeenCalledWith(courseId, mockRequest);
        (deleteCourse as jest.Mock).mockClear();
      }
    });
  });
});
