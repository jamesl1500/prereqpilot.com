/**
 * Unit tests for Program Service
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  createProgram,
  updateProgram,
  deleteProgram,
  getUserPrograms,
  getAllPrograms,
} from '@/services/program-service';
import { createMockQueryBuilder, createMockRequest, mockData } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Program Service', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockSupabase = {
      from: jest.fn(),
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('createProgram', () => {
    it('should successfully create a program', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({ data: mockData.program, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const programData = {
        name: 'Computer Science BS',
        institution: 'University Name',
        institution_id: 'inst-123',
        description: 'Bachelor of Science in Computer Science',
        min_prereq_gpa: 3.0,
        min_overall_gpa: 2.5,
      };

      const result = await createProgram('user-123', programData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('program_requirements');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        { ...programData, user_id: 'user-123' },
      ]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData.program);
    });

    it('should handle errors when creating a program', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Creation failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const programData = {
        name: 'Computer Science BS',
        institution: 'University Name',
        institution_id: 'inst-123',
        description: 'Bachelor of Science in Computer Science',
        min_prereq_gpa: 3.0,
        min_overall_gpa: 2.5,
      };

      const result = await createProgram('user-123', programData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('updateProgram', () => {
    it('should successfully update a program', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const updatedProgram = { ...mockData.program, name: 'Updated Program' };
      mockQueryBuilder.single.mockResolvedValue({ data: updatedProgram, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const updateData = { name: 'Updated Program' };

      const result = await updateProgram('program-123', 'user-123', updateData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('program_requirements');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'program-123');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedProgram);
    });

    it('should handle errors when updating a program', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await updateProgram('program-123', 'user-123', { name: 'Updated' }, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteProgram', () => {
    it('should successfully delete a program', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.select.mockResolvedValue({ data: [{ id: 'program-123' }], error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockData.user },
        error: null,
      });

      const result = await deleteProgram('program-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('program_requirements');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'program-123');
      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting a program', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.select.mockResolvedValue({ data: null, error: new Error('Delete failed') });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockData.user },
        error: null,
      });

      const result = await deleteProgram('program-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('getUserPrograms', () => {
    it('should successfully fetch user programs with institutions', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const mockPrograms = [mockData.program];
      mockQueryBuilder.order.mockResolvedValue({ data: mockPrograms, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserPrograms('user-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('program_requirements');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*, institution:institutions(*)');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPrograms);
    });

    it('should handle errors when fetching programs', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserPrograms('user-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });

  describe('getAllPrograms', () => {
    it('should successfully fetch all programs', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const mockPrograms = [mockData.program];
      mockQueryBuilder.order.mockResolvedValue({ data: mockPrograms, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getAllPrograms(mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('program_requirements');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*, institution:institutions(*)');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPrograms);
    });

    it('should handle errors when fetching all programs', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getAllPrograms(mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });
});
