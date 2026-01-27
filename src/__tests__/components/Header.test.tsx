/**
 * Unit tests for Header component
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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '@/components/Header';

// Mock fetch
global.fetch = jest.fn();

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('should render the logo', () => {
    render(<Header />);
    const logo = screen.getByText('PREREQPILOT');
    expect(logo).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header />);
    // Check for primary navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Programs')).toBeInTheDocument();
    expect(screen.getByText('Plans')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    render(<Header />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should call logout API when logout button is clicked', async () => {
    const mockPush = jest.fn();
    const mockRefresh = jest.fn();
    
    // Mock useRouter
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    });

    render(<Header />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('should handle logout errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<Header />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should have correct logo link to home', () => {
    render(<Header />);
    const logoLink = screen.getByText('PREREQPILOT').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
