/**
 * API Route Tests for Programs
 */

import { GET, POST } from '@/app/api/programs/route';
import { mockProgram } from '../../../utils/test-helpers';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getAllPrograms, createProgram } from '@/services/program-service';
import { getAllProgramRequirements } from '@/services/program-requirement-service';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/program-service');
jest.mock('@/services/program-requirement-service');

describe('Programs API Routes', () => {
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

  describe('GET /api/programs', () => {
    it('should return all programs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (getAllPrograms as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockProgram],
      });

      const request = new NextRequest('http://localhost:3000/api/programs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toEqual(mockProgram);
    });

    it('should return 401 for unauthorized users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      (getAllPrograms as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost:3000/api/programs');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('should handle database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (getAllPrograms as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const request = new NextRequest('http://localhost:3000/api/programs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeTruthy();
    });

    it('should filter programs by institution_id', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (getAllPrograms as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockProgram],
      });

      const request = new NextRequest('http://localhost:3000/api/programs?filter=inst-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
    });
  });

  describe('POST /api/programs', () => {
    it('should create a new program', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (createProgram as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProgram,
      });

      const programData = {
        institution_id: 'inst-123',
        name: 'Computer Science',
        degree_type: 'Bachelor of Science',
        total_credits: 120,
      };

      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: JSON.stringify(programData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should return 401 for unauthorized users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      (createProgram as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (createProgram as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Missing required fields',
      });

      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should handle duplicate program names', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      (createProgram as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Program already exists',
      });

      const programData = {
        institution_id: 'inst-123',
        name: 'Computer Science',
        degree_type: 'Bachelor of Science',
        total_credits: 120,
      };

      const request = new NextRequest('http://localhost:3000/api/programs', {
        method: 'POST',
        body: JSON.stringify(programData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });
  });
});
