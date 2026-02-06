import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlansPageClient from '@/app/plans/PlansPageClient';
import type { User } from '@supabase/supabase-js';
import { createPlan } from '@/services/plan-service';

jest.mock('lucide-react', () => ({
  CalendarDays: () => <span />,
  Plus: () => <span />,
  GraduationCap: () => <span />,
  Building2: () => <span />,
  ChevronRight: () => <span />,
  BookOpen: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/onboarding/TutorialTooltip', () => ({
  __esModule: true,
  default: () => <div data-testid="tutorial-tooltip" />,
}));

jest.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/services/plan-service', () => ({
  createPlan: jest.fn(),
}));

describe('PlansPageClient', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no plans exist', () => {
    render(
      <PlansPageClient user={user} plans={[]} institutions={[]} programs={[]} />
    );

    expect(screen.getByText('No academic plans yet')).toBeInTheDocument();
  });

  it('creates a plan and routes to plan', async () => {
    jest.useFakeTimers();
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

    (createPlan as jest.Mock).mockResolvedValue({ id: 'plan-1' });

    render(
      <PlansPageClient user={user} plans={[]} institutions={[]} programs={[]} />
    );

    fireEvent.click(screen.getByRole('button', { name: /create plan/i }));
    fireEvent.change(screen.getByPlaceholderText(/my bachelor's degree plan/i), { target: { value: 'My Plan' } });
    const createButtons = screen.getAllByRole('button', { name: /create plan/i });
    fireEvent.click(createButtons[createButtons.length - 1]);

    await waitFor(() => {
      expect(createPlan).toHaveBeenCalledWith({
        name: 'My Plan',
        description: undefined,
        institution_id: undefined,
        program_id: undefined,
      });
    });

    jest.runAllTimers();

    expect(push).toHaveBeenCalledWith('/plans/plan-1');
    jest.useRealTimers();
  });

  it('routes to plan detail when selecting a plan', () => {
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
      <PlansPageClient
        user={user}
        plans={[{ id: 'plan-1', name: 'Plan 1', plan_terms: [] } as any]}
        institutions={[]}
        programs={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /plan 1/i }));
    expect(push).toHaveBeenCalledWith('/plans/plan-1');
  });
});
