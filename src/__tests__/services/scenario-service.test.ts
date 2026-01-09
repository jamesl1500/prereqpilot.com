/**
 * Unit tests for Scenario Service
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  createScenario,
  updateScenario,
  deleteScenario,
  getUserScenarios,
  getScenarioById,
} from '@/services/scenario-service';
import { createMockQueryBuilder, createMockRequest, mockData } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Scenario Service', () => {
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

  describe('createScenario', () => {
    it('should successfully create a scenario', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({ data: mockData.scenario, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const scenarioData = {
        name: 'Spring 2025 Plan',
        description: 'Planning for spring semester',
      };

      const result = await createScenario('user-123', scenarioData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('scenarios');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        { ...scenarioData, user_id: 'user-123' },
      ]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData.scenario);
    });

    it('should handle errors when creating a scenario', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Creation failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const scenarioData = {
        name: 'Spring 2025 Plan',
        description: 'Planning for spring semester',
      };

      const result = await createScenario('user-123', scenarioData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('updateScenario', () => {
    it('should successfully update a scenario', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const updatedScenario = { ...mockData.scenario, name: 'Updated Plan' };
      mockQueryBuilder.single.mockResolvedValue({ data: updatedScenario, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const updateData = { name: 'Updated Plan' };

      const result = await updateScenario('scenario-123', 'user-123', updateData, mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('scenarios');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'scenario-123');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedScenario);
    });

    it('should handle errors when updating a scenario', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await updateScenario('scenario-123', 'user-123', { name: 'Updated' }, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteScenario', () => {
    it('should successfully delete a scenario', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await deleteScenario('scenario-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('scenarios');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'scenario-123');
      expect(result.success).toBe(true);
    });

    it('should handle errors when deleting a scenario', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq.mockResolvedValue({ error: new Error('Delete failed') });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await deleteScenario('scenario-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('getUserScenarios', () => {
    it('should successfully fetch user scenarios', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      const mockScenarios = [mockData.scenario];
      mockQueryBuilder.order.mockResolvedValue({ data: mockScenarios, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserScenarios('user-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('scenarios');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockScenarios);
    });

    it('should handle errors when fetching scenarios', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getUserScenarios('user-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });

  describe('getScenarioById', () => {
    it('should successfully fetch a scenario by ID', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({ data: mockData.scenario, error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getScenarioById('scenario-123', mockRequest);

      expect(mockSupabase.from).toHaveBeenCalledWith('scenarios');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'scenario-123');
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData.scenario);
    });

    it('should handle errors when fetching scenario by ID', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);

      const result = await getScenarioById('scenario-123', mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });
});
