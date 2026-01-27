/**
 * Test utilities and helper functions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

/**
 * Creates a mock Supabase client for testing
 */
export function createMockSupabaseClient(): jest.Mocked<SupabaseClient> {
  const mockClient = {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  } as unknown as jest.Mocked<SupabaseClient>;

  return mockClient;
}

/**
 * Creates a mock Supabase query builder
 */
export function createMockQueryBuilder() {
  const mockBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };

  return mockBuilder;
}

/**
 * Creates a mock Request object for testing
 * Since most tests just pass this to mocked functions, we return a minimal mock
 */
export function createMockRequest(
  url: string = 'http://localhost:3000',
  options?: RequestInit
): any {
  return {
    url,
    method: options?.method || 'GET',
    headers: new Map(Object.entries(options?.headers || {})),
    body: options?.body,
    json: () => Promise.resolve(JSON.parse(options?.body as string || '{}')),
    text: () => Promise.resolve(options?.body || ''),
    clone: function() { return this; },
  };
}

/**
 * Mock data generators
 */
export const mockData = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
  course: {
    id: 'course-123',
    user_id: 'user-123',
    course_id: null,
    institution_id: 'inst-123',
    term_id: 'term-123',
    course_title: 'Introduction to Computer Science',
    credits: 3,
    grade: 'A',
    grade_value: 4.0,
    notes: null,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  institution: {
    id: 'inst-123',
    user_id: 'user-123',
    name: 'Test University',
    is_default: true,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  term: {
    id: 'term-123',
    user_id: 'user-123',
    name: 'Fall 2024',
    start_date: '2024-09-01',
    end_date: '2024-12-31',
    is_current: true,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  program: {
    id: 'program-123',
    user_id: 'user-123',
    name: 'Computer Science BS',
    institution_id: 'inst-123',
    description: 'Bachelor of Science in Computer Science',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  scenario: {
    id: 'scenario-123',
    user_id: 'user-123',
    name: 'Spring 2025 Plan',
    description: 'Planning for spring semester',
    created_at: '2024-01-01T00:00:00.000Z',
  },
};
