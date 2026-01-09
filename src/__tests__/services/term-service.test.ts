/**
 * Unit tests for Term Service
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  createTerm,
  updateTerm,
  deleteTerm,
  getUserTerms,
} from '@/services/term-service';
import { createMockQueryBuilder, createMockRequest, mockData } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Term Service', () => {
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

  describe('createTerm', () => {
    it('should successfully create a term', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({ data: mockData.term, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const termData = {
        id: 'term-123',
        name: 'Fall 2024',
        start_date: '2024-09-01',
        end_date: '2024-12-31',
        is_current: true,
      };

      const result = await createTerm('user-123', termData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('terms');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        { ...termData, user_id: 'user-123' },
      ]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData.term);
    });

    it('should handle errors when creating a term', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Creation failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const termData = {
        id: 'term-123',
        name: 'Fall 2024',
        start_date: '2024-09-01',
        end_date: '2024-12-31',
        is_current: true,
      };

      const result = await createTerm('user-123', termData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('updateTerm', () => {
    it('should successfully update a term', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const updatedTerm = { ...mockData.term, name: 'Spring 2025' };
      mockQueryBuilder.single.mockResolvedValue({ data: updatedTerm, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const updateData = { name: 'Spring 2025' };

      const result = await updateTerm('term-123', 'user-123', updateData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('terms');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'term-123');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedTerm);
    });

    it('should handle errors when updating a term', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await updateTerm('term-123', 'user-123', { name: 'Spring 2025' }, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteTerm', () => {
    it('should successfully delete a term', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await deleteTerm('term-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('terms');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'term-123');
      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting a term', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({ error: new Error('Delete failed') });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await deleteTerm('term-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('getUserTerms', () => {
    it('should successfully fetch user terms ordered by start date', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const mockTerms = [mockData.term];
      mockQueryBuilder.order.mockResolvedValue({ data: mockTerms, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserTerms('user-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('terms');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('start_date', { ascending: true });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTerms);
    });

    it('should handle errors when fetching terms', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserTerms('user-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });
});
