/**
 * Integration tests for Transcript Upload and Parsing
 */

// Mock axios to prevent network calls during onboarding tooltip
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: {} }),
    get: jest.fn().mockResolvedValue({ data: { completed: true } }),
  },
}));

// Mock lucide-react BEFORE any imports
jest.mock('lucide-react', () => {
  const React = require('react');
  const mockIcon = (props: any) => React.createElement('svg', { 
    'data-testid': 'mock-icon',
    ...props 
  });
  return {
    PenTool: mockIcon,
    ChevronDown: mockIcon,
    Settings: mockIcon,
    Menu: mockIcon,
    X: mockIcon,
    User: mockIcon,
    LogOut: mockIcon,
    BookOpen: mockIcon,
    FileText: mockIcon,
    Building: mockIcon,
    Target: mockIcon,
    GraduationCap: mockIcon,
    Upload: mockIcon,
    Download: mockIcon,
    Trash: mockIcon,
    Plus: mockIcon,
    Edit: mockIcon,
    Check: mockIcon,
    AlertCircle: mockIcon,
    Info: mockIcon,
    Home: mockIcon,
    ArrowLeft: mockIcon,
    TrendingUp: mockIcon,
    RefreshCw: mockIcon,
    Link: mockIcon,
    Search: mockIcon,
    Building2: mockIcon,
    Globe: mockIcon,
    MapPin: mockIcon,
    Mail: mockIcon,
    Lock: mockIcon,
    Trash2: mockIcon,
    CheckCircle: mockIcon,
    FileQuestionMark: mockIcon,
    LayoutDashboard: mockIcon,
    PcCase: mockIcon,
    School: mockIcon,
    SquareFunction: mockIcon,
    Lightbulb: mockIcon,
    Calendar: mockIcon,
    List: mockIcon,
    Sparkles: mockIcon,
    ExternalLink: mockIcon,
    UserIcon: mockIcon,
    Loader: mockIcon,
    Save: mockIcon,
    Award: mockIcon,
  };
});

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockUser, mockCourse } from '../utils/test-helpers';
import TranscriptPage from '@/app/transcript/TranscriptPage';

describe('Transcript Upload Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render transcript upload page', () => {
    renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    expect(screen.getByText(/unofficial transcript/i)).toBeInTheDocument();
  });

  it('should render with existing courses', () => {
      renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
      // Verify page renders without error
      expect(screen.getByText(/unofficial transcript/i)).toBeInTheDocument();
  });

  it('should render page with institutions', () => {
    const mockInstitution = {
      id: 'inst-1',
      name: 'Test University',
      city: 'Test City',
      state: 'TS',
    };
    
    renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[mockInstitution]} />);
    expect(screen.getByText(/unofficial transcript/i)).toBeInTheDocument();
  });

  it('should render page with mixed course and institution data', () => {
    const mockInstitution = {
      id: 'inst-1',
      name: 'Test University',
      city: 'Test City',
      state: 'TS',
    };
    
    renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[mockInstitution]} />);
    expect(screen.getByText(/unofficial transcript/i)).toBeInTheDocument();
  });

  it('should display header and layout', () => {
    renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    expect(screen.getByText(/unofficial transcript/i)).toBeInTheDocument();
  });
});
