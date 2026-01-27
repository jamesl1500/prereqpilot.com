/**
 * Unit tests for Plan Service
 */

import { createMockSupabaseClient, createMockSupabaseQueryBuilder, mockAcademicPlan } from '../utils/test-helpers';
import { createClient } from '@/lib/supabase/client';
import { createPlan, getUserPlans, updatePlan, deletePlannedCourse } from '@/services/plan-service';

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

  describe('deletePlannedCourse', () => {
    it('should delete a planned course', async () => {
      const mockQueryBuilder = createMockSupabaseQueryBuilder(null, null);
      mockSupabase.from = jest.fn(() => mockQueryBuilder);

      await expect(deletePlannedCourse('course-123')).resolves.not.toThrow();
    });
  });
});
