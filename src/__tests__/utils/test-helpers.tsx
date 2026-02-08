/**
 * Test Helper Utilities
 * Provides common functions and mocks for testing
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/shared/Toast';

// Custom render function with providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

// Mock Supabase query builder
export function createMockSupabaseQueryBuilder(data: unknown = null, error: Error | null = null) {
  const mockBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    maybeSingle: jest.fn().mockResolvedValue({ data, error }),
    then: jest.fn((callback) => callback({ data, error })),
  };

  return mockBuilder;
}

// Mock Supabase client
export function createMockSupabaseClient(overrides = {}) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: jest.fn(() => createMockSupabaseQueryBuilder()),
    ...overrides,
  };
}

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_metadata: {
    full_name: 'Test User',
  },
  app_metadata: {},
  aud: 'authenticated',

};

// Mock session data
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  user: mockUser,
};

// Mock course data
export const mockCourse = {
  id: 'course-123',
  user_id: 'test-user-id',
  code: 'CS101',
  title: 'Introduction to Computer Science',
  credits: 3,
  grade: 'A',
  term_id: 'term-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock term data
export const mockTerm = {
  id: 'term-123',
  user_id: 'test-user-id',
  name: 'Fall 2024',
  start_date: '2024-09-01',
  end_date: '2024-12-15',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock institution data
export const mockInstitution = {
  id: 'inst-123',
  name: 'Test University',
  domain: 'test.edu',
  city: 'Test City',
  state: 'TS',
  country: 'USA',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock program data
export const mockProgram = {
  id: 'prog-123',
  institution_id: 'inst-123',
  name: 'Computer Science',
  degree_type: 'Bachelor of Science',
  total_credits: 120,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock scenario data
export const mockScenario = {
  id: 'scenario-123',
  user_id: 'test-user-id',
  name: 'Test Scenario',
  description: 'Testing scenario',
  target_gpa: 3.5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  program_id: 'prog-123',
};

// Mock academic plan data
export const mockAcademicPlan = {
  id: 'plan-123',
  user_id: 'test-user-id',
  program_id: 'prog-123',
  name: 'My Academic Plan',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock fetch responses
export function mockFetch(data: unknown, status = 200, ok = true) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
  );
}

// Mock fetch error
export function mockFetchError(error: Error) {
  global.fetch = jest.fn(() => Promise.reject(error));
}

// Wait for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// Create mock router
export function createMockRouter(overrides = {}) {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    ...overrides,
  };
}

// Form validation helpers
export function expectFormError(container: HTMLElement, errorText: string) {
  const errorElement = container.querySelector('[role="alert"]') || 
                      container.querySelector('.error') ||
                      container.querySelector('[class*="error"]');
  expect(errorElement).toHaveTextContent(errorText);
}

// Accessibility helpers
export function expectAriaLabel(element: HTMLElement, label: string) {
  expect(element).toHaveAttribute('aria-label', label);
}

export function expectAriaExpanded(element: HTMLElement, expanded: boolean) {
  expect(element).toHaveAttribute('aria-expanded', expanded.toString());
}

// Mock localStorage
export function mockLocalStorage() {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
}

// Mock window.location
export function mockWindowLocation(url: string) {
  delete (window as any).location;
  window.location = new URL(url) as any;
}

// Create mock FormData
export function createMockFormData(data: Record<string, string>) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

export * from '@testing-library/react';
