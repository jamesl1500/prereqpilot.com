// Mock Next/Link
jest.mock('next/link', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, href, className, ...props }: any) => {
      return React.createElement('a', { href, className, ...props }, children);
    },
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
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
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

import '@testing-library/jest-dom';

// Polyfill Web APIs for Next.js server components
// Use a minimal polyfill that's compatible with Next.js
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    private _url: string;
    method: string;
    headers: Map<string, string>;
    body: any;

    constructor(input: string | Request, init?: RequestInit) {
      if (typeof input === 'string') {
        this._url = input;
      } else {
        this._url = input.url;
      }
      this.method = init?.method || 'GET';
      this.headers = new Map();
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string);
        });
      }
      this.body = init?.body;
    }

    get url() {
      return this._url;
    }

    json() {
      return Promise.resolve(JSON.parse(this.body || '{}'));
    }

    text() {
      return Promise.resolve(this.body || '');
    }

    clone() {
      return new Request(this._url, {
        method: this.method,
        headers: Object.fromEntries(this.headers),
        body: this.body,
      });
    }
  } as any;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: any;
    status: number;
    statusText: string;
    headers: Map<string, string>;

    constructor(body?: any, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Map();
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string);
        });
      }
    }

    json() {
      return Promise.resolve(JSON.parse(this.body || '{}'));
    }

    text() {
      return Promise.resolve(this.body || '');
    }

    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    }
  } as any;
}

if (typeof global.Headers === 'undefined') {
  global.Headers = Map as any;
}

// Import Next.js after polyfills
const { NextRequest, NextResponse } = require('next/server');

// Make NextRequest and NextResponse available globally for tests
(global as any).NextRequest = NextRequest;
(global as any).NextResponse = NextResponse;

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createRouteHandlerClient: jest.fn(),
  createServerClient: jest.fn(),
  createServerComponentClient: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null 
      }),
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: { user: { id: 'test-user-id' } } }, 
        error: null 
      }),
      signOut: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    })),
  })),
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null 
      }),
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: { user: { id: 'test-user-id' } } }, 
        error: null 
      }),
      signOut: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => 'ChevronLeft',
  ChevronRight: () => 'ChevronRight',
  ChevronDown: () => 'ChevronDown',
  ChevronUp: () => 'ChevronUp',
  Plus: () => 'Plus',
  Search: () => 'Search',
  Edit: () => 'Edit',
  Trash2: () => 'Trash2',
  Trash: () => 'Trash',
  X: () => 'X',
  XCircle: () => 'XCircle',
  Check: () => 'Check',
  CheckCircle: () => 'CheckCircle',
  CheckSquare: () => 'CheckSquare',
  Square: () => 'Square',
  AlertCircle: () => 'AlertCircle',
  BookOpen: () => 'BookOpen',
  GraduationCap: () => 'GraduationCap',
  Building: () => 'Building',
  Building2: () => 'Building2',
  Users: () => 'Users',
  User: () => 'User',
  Settings: () => 'Settings',
  LogOut: () => 'LogOut',
  Home: () => 'Home',
  FileText: () => 'FileText',
  Calendar: () => 'Calendar',
  TrendingUp: () => 'TrendingUp',
  RefreshCw: () => 'RefreshCw',
  Award: () => 'Award',
  Target: () => 'Target',
  Clock: () => 'Clock',
  Info: () => 'Info',
  Upload: () => 'Upload',
  Download: () => 'Download',
  ExternalLink: () => 'ExternalLink',
  Mail: () => 'Mail',
  Lock: () => 'Lock',
  Eye: () => 'Eye',
  EyeOff: () => 'EyeOff',
  LibraryBig: () => 'LibraryBig',
  School2: () => 'School2',
  ArrowLeft: () => 'ArrowLeft',
  Menu: () => 'Menu',
  Sparkles: () => 'Sparkles',
  Loader: () => 'Loader',
  Save: () => 'Save',
  MapPin: () => 'MapPin',
  Globe: () => 'Globe',
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
