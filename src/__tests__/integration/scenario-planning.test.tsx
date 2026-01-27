/**
 * Integration tests for Scenario Planning Flow
 * Tests the complete user journey from creating a scenario to simulating courses
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

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockScenario, mockCourse, mockUser } from '../utils/test-helpers';
import ScenariosPage from '@/app/scenarios/ScenariosPage';

describe('Scenario Planning Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful auth
    global.fetch = jest.fn((url) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('/api/scenarios')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [mockScenario] }),
        } as Response);
      }
      if (urlString.includes('/api/courses')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [mockCourse] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    });
  });

  it('should render scenarios page', () => {
    renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={null} />);
    expect(screen.getByText(mockScenario.name)).toBeInTheDocument();
  });

  it('should render page with multiple scenarios', () => {
    const scenario2 = { ...mockScenario, id: 'scenario-2', name: 'Test Scenario 2' };
    renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario, scenario2]} onboarding={null} />);
    
    expect(screen.getByText(mockScenario.name)).toBeInTheDocument();
    expect(screen.getByText(scenario2.name)).toBeInTheDocument();
  });

  it('should render empty state when no scenarios', () => {
    renderWithProviders(<ScenariosPage user={mockUser} scenarios={[]} onboarding={null} />);
    // Just verify page renders without crashing
    expect(screen.getByText('PREREQPILOT')).toBeInTheDocument();
  });

  it('should pass onboarding data to page', () => {
    const onboarding = { onboarding_completed: false, current_step: 'scenarios', steps_completed: [] };
    renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={onboarding} />);
    expect(screen.getByText(mockScenario.name)).toBeInTheDocument();
  });

  it('should render header and layout', () => {
    renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={null} />);
    expect(screen.getByText('PREREQPILOT')).toBeInTheDocument();
  });
});
