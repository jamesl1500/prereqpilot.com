/**
 * Unit tests for Course Service
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getUserCourses,
  calculateOverallGPA,
  gradeToGPA,
} from '@/services/course-service';
import { createMockQueryBuilder, createMockRequest, mockData } from '../utils/test-utils';

// Mock the Supabase client
jest.mock('@/lib/supabase/server');

describe('Course Service', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockSupabase = {
      from: jest.fn(),
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('gradeToGPA', () => {
    it('should have correct GPA mappings', () => {
      expect(gradeToGPA['A+']).toBe(4.0);
      expect(gradeToGPA['A']).toBe(4.0);
      expect(gradeToGPA['A-']).toBe(3.7);
      expect(gradeToGPA['B+']).toBe(3.3);
      expect(gradeToGPA['B']).toBe(3.0);
      expect(gradeToGPA['B-']).toBe(2.7);
      expect(gradeToGPA['C+']).toBe(2.3);
      expect(gradeToGPA['C']).toBe(2.0);
      expect(gradeToGPA['C-']).toBe(1.7);
      expect(gradeToGPA['D+']).toBe(1.3);
      expect(gradeToGPA['D']).toBe(1.0);
      expect(gradeToGPA['D-']).toBe(0.7);
      expect(gradeToGPA['F']).toBe(0.0);
    });
  });

  describe('createCourse', () => {
    it('should successfully create a course', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({ data: mockData.course, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const courseData = {
        id: 'course-123',
        code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 3,
      };

      const result = await createCourse('user-123', courseData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('taken_courses');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        { ...courseData, user_id: 'user-123' },
      ]);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockData.course });
    });

    it('should handle errors when creating a course', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const courseData = {
        id: 'course-123',
        code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 3,
      };

      const result = await createCourse('user-123', courseData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateCourse', () => {
    it('should successfully update a course', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const updatedCourse = { ...mockData.course, credits: 4 };
      mockQueryBuilder.single.mockResolvedValue({ data: updatedCourse, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const updateData = { credits: 4 };

      const result = await updateCourse('course-123', 'user-123', updateData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('taken_courses');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'course-123');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result).toEqual({ success: true, data: updatedCourse });
    });

    it('should handle errors when updating a course', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await updateCourse('course-123', 'user-123', { credits: 4 }, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteCourse', () => {
    it('should successfully delete a course', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await deleteCourse('course-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('taken_courses');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'course-123');
      expect(result).toEqual({ success: true });
    });

    it('should handle errors when deleting a course', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({ error: new Error('Delete failed') });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await deleteCourse('course-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('getUserCourses', () => {
    it('should successfully fetch user courses', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const mockCourses = [mockData.course];
      mockQueryBuilder.order.mockResolvedValue({ data: mockCourses, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserCourses('user-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('taken_courses');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual({ success: true, data: mockCourses });
    });

    it('should handle errors when fetching courses', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserCourses('user-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });

  describe('calculateOverallGPA', () => {
    it('should calculate GPA correctly for multiple courses', () => {
      const courses = [
        { grade: 'A', credits: 3 }, // 4.0 * 3 = 12
        { grade: 'B', credits: 4 }, // 3.0 * 4 = 12
        { grade: 'A-', credits: 3 }, // 3.7 * 3 = 11.1
      ];

      const gpa = calculateOverallGPA(courses);
      // Total: (12 + 12 + 11.1) / 10 = 3.51
      expect(gpa).toBeCloseTo(3.51, 2);
    });

    it('should return 0 for empty courses array', () => {
      const gpa = calculateOverallGPA([]);
      expect(gpa).toBe(0);
    });

    it('should ignore courses with invalid grades', () => {
      const courses = [
        { grade: 'A', credits: 3 },
        { grade: 'INVALID', credits: 4 },
        { grade: 'B', credits: 3 },
      ];

      const gpa = calculateOverallGPA(courses);
      // Only A and B count: (4.0 * 3 + 3.0 * 3) / 6 = 3.5
      expect(gpa).toBeCloseTo(3.5, 2);
    });

    it('should handle courses with zero credits', () => {
      const courses = [
        { grade: 'A', credits: 0 },
        { grade: 'B', credits: 3 },
      ];

      const gpa = calculateOverallGPA(courses);
      expect(gpa).toBe(3.0);
    });

    it('should calculate perfect GPA', () => {
      const courses = [
        { grade: 'A+', credits: 3 },
        { grade: 'A', credits: 4 },
      ];

      const gpa = calculateOverallGPA(courses);
      expect(gpa).toBe(4.0);
    });
  });
});
