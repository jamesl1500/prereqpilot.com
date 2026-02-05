/**
 * Unit tests for PublicHeader component
 */

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

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-helpers';
import PublicHeader from '@/components/PublicHeader';

describe('PublicHeader', () => {
  it('should render the logo and brand name', () => {
    renderWithProviders(<PublicHeader user={null} />);
    
    expect(screen.getByText('PREREQPILOT')).toBeInTheDocument();
  });

  it('should show navigation links when not authenticated', () => {
    renderWithProviders(<PublicHeader user={null} />);
    
    // Check for main navigation links
    expect(screen.getByText('PREREQPILOT')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should show navigation links when authenticated', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
    };

    renderWithProviders(<PublicHeader user={mockUser} />);
    
    // Check for navigation structure
    expect(screen.getByText('PREREQPILOT')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should show mobile menu button', () => {
    renderWithProviders(<PublicHeader />);
    
    // Check for mobile menu button
    const mobileButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(mobileButton).toBeInTheDocument();
  });

  it('should have accessible navigation structure', () => {
    renderWithProviders(<PublicHeader />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
