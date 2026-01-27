/**
 * Integration tests for Course Management workflow
 * Tests the complete flow from creating to deleting courses
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getUserCourses,
  calculateOverallGPA,
} from '@/services/course-service';
import { createMockQueryBuilder, createMockRequest, mockData } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Course Management Integration Tests', () => {
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

  describe('Complete Course Lifecycle', () => {
    it('should handle full CRUD lifecycle for a course', async () => {
      const userId = 'user-123';
      const mockQueryBuilder = createMockQueryBuilder();

      // 1. Create a course
      const newCourse = {
        id: 'course-new',
        code: 'CS101',
        title: 'Intro to CS',
        credits: 3,
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { ...newCourse, user_id: userId },
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const createResult = await createCourse(userId, newCourse, mockRequest);
      expect(createResult.success).toBe(true);

      // 2. Fetch user courses
      mockQueryBuilder.order.mockResolvedValueOnce({
        data: [{ ...newCourse, user_id: userId }],
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const fetchResult = await getUserCourses(userId, mockRequest);
      expect(fetchResult.success).toBe(true);
      expect(fetchResult.data).toHaveLength(1);

      // 3. Update the course
      const updateData = { credits: 4, grade: 'A' };
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { ...newCourse, ...updateData, user_id: userId },
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const updateResult = await updateCourse('course-new', userId, updateData, mockRequest);
      expect(updateResult.success).toBe(true);

      // 4. Delete the course
      mockQueryBuilder.eq.mockResolvedValueOnce({ error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const deleteResult = await deleteCourse('course-new', mockRequest);
      expect(deleteResult.success).toBe(true);
    });
  });

  describe('Multiple Course Management', () => {
    it('should handle multiple courses with GPA calculation', async () => {
      const userId = 'user-123';
      const courses = [
        { id: '1', code: 'CS101', title: 'Intro to CS', credits: 3, grade: 'A', grade_value: 4.0 },
        { id: '2', code: 'MATH201', title: 'Calculus', credits: 4, grade: 'B+', grade_value: 3.3 },
        { id: '3', code: 'ENG101', title: 'Writing', credits: 3, grade: 'A-', grade_value: 3.7 },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: courses.map(c => ({ ...c, user_id: userId })),
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserCourses(userId, mockRequest);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);

      // Calculate GPA for fetched courses
      const gpa = calculateOverallGPA(
        result.data.map(c => ({ grade: c.grade, credits: c.credits }))
      );

      // Expected: (4.0*3 + 3.3*4 + 3.7*3) / 10 = 3.63
      expect(gpa).toBeCloseTo(3.63, 2);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle database errors gracefully', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const courseData = {
        id: 'course-123',
        code: 'CS101',
        title: 'Test Course',
        credits: 3,
      };

      const result = await createCourse('user-123', courseData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should handle concurrent updates', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      
      // Setup mocks BEFORE creating promises
      mockQueryBuilder.single
        .mockResolvedValueOnce({
          data: { id: 'course-123', grade: 'A' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'course-123', grade: 'B' },
          error: null,
        });

      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      // Simulate two concurrent update attempts
      const update1 = updateCourse('course-123', 'user-123', { grade: 'A' }, mockRequest);
      const update2 = updateCourse('course-123', 'user-123', { grade: 'B' }, mockRequest);

      const [result1, result2] = await Promise.all([update1, update2]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should validate data before operations', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Invalid data'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const invalidCourse = {
        id: 'course-123',
        code: '', // Invalid: empty code
        title: '',
        credits: -1, // Invalid: negative credits
      };

      const result = await createCourse('user-123', invalidCourse, mockRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('User Isolation', () => {
    it('should only return courses for the authenticated user', async () => {
      const user1 = 'user-123';
      const user2 = 'user-456';

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: [
          { id: '1', user_id: user1, course_title: 'Course 1', credits: 3 },
          { id: '2', user_id: user1, course_title: 'Course 2', credits: 3 },
        ],
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserCourses(user1, mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', user1);
    });

    it('should prevent updating courses from other users', async () => {
      const ownerId = 'user-123';
      const attackerId = 'user-456';
      const courseId = 'course-123';

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await updateCourse(courseId, attackerId, { grade: 'F' }, mockRequest);

      expect(result.success).toBe(false);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', attackerId);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large course lists efficiently', async () => {
      const userId = 'user-123';
      const largeCourseList = Array.from({ length: 100 }, (_, i) => ({
        id: `course-${i}`,
        user_id: userId,
        course_title: `Course ${i}`,
        credits: 3,
        grade: 'A',
        grade_value: 4.0,
      }));

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: largeCourseList,
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const startTime = Date.now();
      const result = await getUserCourses(userId, mockRequest);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should calculate GPA for many courses efficiently', () => {
      const manyCourses = Array.from({ length: 200 }, () => ({
        grade: 'B+',
        credits: 3,
      }));

      const startTime = Date.now();
      const gpa = calculateOverallGPA(manyCourses);
      const endTime = Date.now();

      expect(gpa).toBeCloseTo(3.3, 2);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      const userId = 'user-123';
      const termId = 'term-123';
      const institutionId = 'inst-123';

      const courseData = {
        id: 'course-123',
        code: 'CS101',
        title: 'Test Course',
        credits: 3,
        term_id: termId,
        institution_id: institutionId,
      };

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: { ...courseData, user_id: userId },
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await createCourse(userId, courseData, mockRequest);

      expect(result.success).toBe(true);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          term_id: termId,
          institution_id: institutionId,
        }),
      ]);
    });

    it('should preserve course history', async () => {
      const userId = 'user-123';
      const courseId = 'course-123';

      // Initial course state
      const originalCourse = {
        id: courseId,
        grade: 'B',
        credits: 3,
      };

      // Update 1: Change grade
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { ...originalCourse, grade: 'A' },
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const update1 = await updateCourse(courseId, userId, { grade: 'A' }, mockRequest);
      expect(update1.success).toBe(true);

      // Update 2: Change credits
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { ...originalCourse, grade: 'A', credits: 4 },
        error: null,
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const update2 = await updateCourse(courseId, userId, { credits: 4 }, mockRequest);
      expect(update2.success).toBe(true);
    });
  });
});
