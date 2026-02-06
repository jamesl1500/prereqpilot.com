import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramsPage from '@/app/programs/ProgramsPage';
import type { User } from '@supabase/supabase-js';

jest.mock('lucide-react', () => ({
  GraduationCap: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/modals/ProgramModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="program-modal" /> : null),
}));

jest.mock('@/components/modals/DeleteModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="delete-modal" /> : null),
}));

jest.mock('@/components/onboarding/TutorialTooltip', () => ({
  __esModule: true,
  default: () => <div data-testid="tutorial-tooltip" />,
}));

jest.mock('@/components/onboarding/OnboardingModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="onboarding-modal" /> : null),
}));

describe('ProgramsPage', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state and opens add program modal', () => {
    render(
      <ProgramsPage
        user={user}
        programs={[]}
        userInstitutions={[]}
        allInstitutions={[]}
        onboarding={null}
      />
    );

    expect(screen.getByText('No programs yet')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add your first program/i }));
    expect(screen.getByTestId('program-modal')).toBeInTheDocument();
  });

  it('routes to program detail', () => {
    const push = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push,
      refresh: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    });

    render(
      <ProgramsPage
        user={user}
        programs={[{ id: 'prog-1', name: 'Program 1', is_official: false, min_prereq_gpa: 3.5, min_overall_gpa: null }] as any}
        userInstitutions={[]}
        allInstitutions={[]}
        onboarding={null}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    expect(push).toHaveBeenCalledWith('/programs/prog-1');
  });
});
