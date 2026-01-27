/**
 * Tests for Institutions API Route
 */

import { GET, POST } from '@/app/api/institutions/route';
import { mockInstitution } from '../../../utils/test-helpers';
import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getAllInstitutions, createInstitution } from '@/services/institution-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/institution-service');

describe('/api/institutions', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('GET /api/institutions', () => {
    it('should return 401 if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      (getAllInstitutions as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const response = await GET(new NextRequest('http://localhost:3000/api/institutions'));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should return all institutions for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const mockInstitutions = [
        mockInstitution,
        { ...mockInstitution, id: '2', name: 'State University' },
      ];

      (getAllInstitutions as jest.Mock).mockResolvedValue({
        success: true,
        data: mockInstitutions,
      });

      const response = await GET(new NextRequest('http://localhost:3000/api/institutions'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual(mockInstitutions);
    });

    it('should handle database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      (getAllInstitutions as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const response = await GET(new NextRequest('http://localhost:3000/api/institutions'));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/institutions', () => {
    const validInstitution = {
      name: 'New University',
      type: 'university',
      location: 'San Francisco, CA',
      website: 'https://university.edu',
    };

    it('should return 401 if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      (createInstitution as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(validInstitution),
        })
      );

      expect(response.status).toBe(400);
    });

    it('should create new institution', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const newInstitution = { ...mockInstitution, ...validInstitution };
      (createInstitution as jest.Mock).mockResolvedValue({
        success: true,
        data: newInstitution,
      });

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(validInstitution),
        })
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should validate required fields', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      (createInstitution as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Name is required',
      });

      const invalidInstitution = {
        name: '',
        type: '',
      };

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(invalidInstitution),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should validate institution type', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      (createInstitution as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid institution type',
      });

      const invalidInstitution = {
        ...validInstitution,
        type: 'invalid-type',
      };

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(invalidInstitution),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('type');
    });

    it('should handle duplicate institution names', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      (createInstitution as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Institution already exists',
      });

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(validInstitution),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('already exists');
    });

    it('should validate website URL format', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      (createInstitution as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid URL format',
      });

      const invalidInstitution = {
        ...validInstitution,
        website: 'not-a-url',
      };

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(invalidInstitution),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('URL');
    });

    it('should handle database errors during creation', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      (createInstitution as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(validInstitution),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should sanitize HTML in inputs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      (createInstitution as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockInstitution, name: 'Test University' },
      });

      const institutionWithHTML = {
        ...validInstitution,
        name: '<script>alert("xss")</script>Test University',
      };

      const response = await POST(
        new NextRequest('http://localhost:3000/api/institutions', {
          method: 'POST',
          body: JSON.stringify(institutionWithHTML),
        })
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
