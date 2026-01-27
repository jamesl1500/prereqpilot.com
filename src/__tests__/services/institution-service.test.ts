/**
 * Unit tests for Institution Service
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  createInstitution,
  updateInstitution,
} from '@/services/institution-service';
import { createMockQueryBuilder, createMockRequest, mockData } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Institution Service', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  describe('createInstitution', () => {
    it('should successfully create an institution', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.insert.mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockData.user },
        error: null,
      });

      const institutionData = {
        name: 'Test University',
        short_code: 'TU',
        country: 'USA',
        website: 'https://test.edu',
      };

      const result = await createInstitution(institutionData, mockRequest);

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('institutions');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        {
          name: 'Test University',
          short_code: 'TU',
          country: 'USA',
          website_url: 'https://test.edu',
          user_id: mockData.user.id,
        },
      ]);
      expect(result.success).toBe(true);
    });

    it('should return unauthorized if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const institutionData = {
        name: 'Test University',
        short_code: 'TU',
      };

      const result = await createInstitution(institutionData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle null optional fields', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.insert.mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockData.user },
        error: null,
      });

      const institutionData = {
        name: 'Test University',
        short_code: 'TU',
      };

      const result = await createInstitution(institutionData, mockRequest);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([
        {
          name: 'Test University',
          short_code: 'TU',
          country: null,
          website_url: null,
          user_id: mockData.user.id,
        },
      ]);
      expect(result.success).toBe(true);
    });

    it('should handle database errors', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.insert.mockResolvedValue({
        error: new Error('Database error'),
      });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockData.user },
        error: null,
      });

      const institutionData = {
        name: 'Test University',
        short_code: 'TU',
      };

      const result = await createInstitution(institutionData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateInstitution', () => {
    it('should successfully update an institution', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      // For chained .eq() calls: first returns the builder, second resolves with result
      mockQueryBuilder.eq
        .mockReturnValueOnce(mockQueryBuilder)  // First .eq('id', 'inst-123') returns builder
        .mockResolvedValueOnce({ error: null }); // Second .eq('user_id', 'user-123') resolves
      mockSupabase.from.mockReturnValue(mockQueryBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockData.user },
        error: null,
      });

      const institutionData = {
        name: 'Updated University',
        short_code: 'UU',
        country: 'Canada',
        website: 'https://updated.edu',
      };

      const result = await updateInstitution('inst-123', institutionData, mockRequest);

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('institutions');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        name: 'Updated University',
        short_code: 'UU',
        country: 'Canada',
        website_url: 'https://updated.edu',
      });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'inst-123');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', mockData.user.id);
      expect(result.success).toBe(true);
    });

    it('should return unauthorized if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const institutionData = {
        name: 'Updated University',
        short_code: 'UU',
      };

      const result = await updateInstitution('inst-123', institutionData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should handle update errors', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.eq
        .mockReturnValueOnce(mockQueryBuilder)  // First .eq() returns builder
        .mockResolvedValueOnce({                // Second .eq() resolves with error
          error: new Error('Update failed'),
        });
      mockSupabase.from.mockReturnValue(mockQueryBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockData.user },
        error: null,
      });

      const institutionData = {
        name: 'Updated University',
        short_code: 'UU',
      };

      const result = await updateInstitution('inst-123', institutionData, mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
});
