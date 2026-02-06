/**
 * Unit tests for Plan Service
 */

import { createMockSupabaseClient, createMockSupabaseQueryBuilder, mockAcademicPlan } from '../utils/test-helpers';
import { createClient } from '@/lib/supabase/client';
import {
  createPlan,
  getUserPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  setActivePlan,
  createPlanTerm,
  updatePlanTerm,
  deletePlanTerm,
  reorderPlanTerms,
  addPlannedCourse,
  updatePlannedCourse,
  deletePlannedCourse,
  markCourseCompleted,
  moveCourseToTerm,
  getTermCredits,
} from '@/services/plan-service';

jest.mock('@/lib/supabase/client');

describe('Plan Service', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('createPlan', () => {
    it('should create a new academic plan', async () => {
      const planData = {
        name: 'My Plan',
        program_id: 'prog-123',
      };

      const mockQueryBuilder = createMockSupabaseQueryBuilder(mockAcademicPlan, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);
      mockSupabase.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await createPlan(planData);

      expect(result).toEqual(mockAcademicPlan);
      expect(result.id).toBeDefined();
    });

    it('should handle errors', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(null, new Error('DB error'));
      mockSupabase.from = jest.fn(() => mockQueryBuilder);
      mockSupabase.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      await expect(createPlan({ name: 'My Plan', program_id: 'prog-123' })).rejects.toThrow('DB error');
    });
  });

  describe('getUserPlans', () => {
    it('should retrieve all user plans', async () => {
      const plans = [mockAcademicPlan];

      const mockQueryBuilder = createMockSupabaseQueryBuilder(plans, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      const result = await getUserPlans();

      expect(result).toEqual(plans);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getPlanById', () => {
    it('should retrieve a plan by id', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(mockAcademicPlan, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      const result = await getPlanById('plan-123');

      expect(result).toEqual(mockAcademicPlan);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'plan-123');
    });
  });

  describe('updatePlan', () => {
    it('should update plan details', async () => {
      const updates = { name: 'Updated Plan' };
      const updatedPlan = { ...mockAcademicPlan, ...updates };

      const mockQueryBuilder = createMockSupabaseQueryBuilder(updatedPlan, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      const result = await updatePlan('plan-123', updates);

      expect(result).toEqual(updatedPlan);
      expect(result.name).toBe('Updated Plan');
    });
  });

  describe('deletePlan', () => {
    it('should delete a plan', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(null, null);
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      await expect(deletePlan('plan-123')).resolves.not.toThrow();
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
    });
  });

  describe('setActivePlan', () => {
    it('should deactivate others and activate selected plan', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(null, null);
      mockQueryBuilder.eq
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: null });
      mockSupabase.from = jest.fn(() => mockQueryBuilder);
      mockSupabase.auth = {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      await expect(setActivePlan('plan-123')).resolves.not.toThrow();
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ is_active: false });
    });
  });

  describe('plan terms', () => {
    it('creates a plan term with next display order', async () => {
      const selectBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [{ display_order: 2 }] }),
      } as any;
      const insertBuilder = createMockSupabaseQueryBuilder({ id: 'term-1' }, null);

      mockSupabase.from = jest
        .fn()
        .mockImplementationOnce(() => selectBuilder)
        .mockImplementationOnce(() => insertBuilder);

      const result = await createPlanTerm('plan-123', { name: 'Fall 2024' } as any);

      expect(result).toEqual({ id: 'term-1' });
      expect(insertBuilder.insert).toHaveBeenCalledWith({
        plan_id: 'plan-123',
        name: 'Fall 2024',
        display_order: 3,
      });
    });

    it('updates a plan term', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder({ id: 'term-1' }, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      const result = await updatePlanTerm('term-1', { name: 'Spring 2025' } as any);

      expect(result).toEqual({ id: 'term-1' });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ name: 'Spring 2025' });
    });

    it('deletes a plan term', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(null, null);
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      await expect(deletePlanTerm('term-1')).resolves.not.toThrow();
    });

    it('reorders plan terms', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(null, null);
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      await expect(
        reorderPlanTerms([
          { id: 'term-1', display_order: 1 },
          { id: 'term-2', display_order: 2 },
        ])
      ).resolves.not.toThrow();
    });
  });

  describe('planned courses', () => {
    it('adds a planned course with next display order', async () => {
      const selectBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [] }),
      } as any;
      const insertBuilder = createMockSupabaseQueryBuilder({ id: 'pc-1' }, null);

      mockSupabase.from = jest
        .fn()
        .mockImplementationOnce(() => selectBuilder)
        .mockImplementationOnce(() => insertBuilder);

      const result = await addPlannedCourse('term-1', { course_id: 'c1' } as any);

      expect(result).toEqual({ id: 'pc-1' });
      expect(insertBuilder.insert).toHaveBeenCalledWith({
        plan_term_id: 'term-1',
        course_id: 'c1',
        display_order: 0,
      });
    });

    it('updates a planned course', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder({ id: 'pc-1' }, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      const result = await updatePlannedCourse('pc-1', { credits: 4 } as any);

      expect(result).toEqual({ id: 'pc-1' });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({ credits: 4 });
    });

    it('marks a course completed', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder({ id: 'pc-1' }, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      const result = await markCourseCompleted('pc-1', true, 'taken-1');

      expect(result).toEqual({ id: 'pc-1' });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        is_completed: true,
        taken_course_id: 'taken-1',
      });
    });

    it('moves a course to a new term with next display order', async () => {
      const selectBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [{ display_order: 1 }] }),
      } as any;
      const updateBuilder = createMockSupabaseQueryBuilder({ id: 'pc-1' }, null);

      mockSupabase.from = jest
        .fn()
        .mockImplementationOnce(() => selectBuilder)
        .mockImplementationOnce(() => updateBuilder);

      const result = await moveCourseToTerm('pc-1', 'term-2');

      expect(result).toEqual({ id: 'pc-1' });
      expect(updateBuilder.update).toHaveBeenCalledWith({
        plan_term_id: 'term-2',
        display_order: 2,
      });
    });

    it('returns total term credits', async () => {
      const selectBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ credits: 3 }, { credits: 2 }], error: null }),
      } as any;

      mockSupabase.from = jest.fn(() => selectBuilder);

      const result = await getTermCredits('term-1');

      expect(result).toBe(5);
    });
  });

  describe('deletePlannedCourse', () => {
    it('should delete a planned course', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(null, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      await expect(deletePlannedCourse('course-123')).resolves.not.toThrow();
    });
  });
});
