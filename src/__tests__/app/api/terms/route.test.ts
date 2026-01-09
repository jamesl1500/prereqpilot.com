/**
 * Unit tests for Terms API Routes
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/terms/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getUserTerms, createTerm } from '@/services/term-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/term-service');

describe('Terms API Routes', () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost:3000/api/terms');
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('GET /api/terms', () => {
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

    it('should return user terms when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockTerms = [
        {
          id: 'term-1',
          name: 'Fall 2024',
          start_date: '2024-09-01',
          end_date: '2024-12-31',
          is_current: true,
        },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (getUserTerms as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTerms,
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockTerms);
      expect(getUserTerms).toHaveBeenCalledWith(mockUser.id, mockRequest);
    });

    it('should handle service errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (getUserTerms as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });
  });

  describe('POST /api/terms', () => {
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

    it('should create a term when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const termData = {
        name: 'Spring 2025',
        start_date: '2025-01-15',
        end_date: '2025-05-15',
        is_current: false,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (createTerm as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'term-1', ...termData },
      });

      jest.spyOn(mockRequest, 'json').mockResolvedValue(termData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(createTerm).toHaveBeenCalledWith(mockUser.id, termData, mockRequest);
    });

    it('should handle validation errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const invalidData = { name: '' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (createTerm as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Term name is required',
      });

      jest.spyOn(mockRequest, 'json').mockResolvedValue(invalidData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Term name is required');
    });
  });
});
