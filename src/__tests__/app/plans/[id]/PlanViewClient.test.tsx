import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlanViewClient from '@/app/plans/[id]/PlanViewClient';
import type { User } from '@supabase/supabase-js';
import {
  markCourseCompleted,
  createPlanTerm,
} from '@/services/plan-service';

jest.mock('lucide-react', () => ({
  CalendarDays: () => <span />,
  Plus: () => <span />,
  ArrowLeft: () => <span />,
  BookOpen: () => <span />,
  Trash2: () => <span />,
  CheckCircle2: () => <span />,
  Circle: () => <span />,
  ChevronRight: () => <span />,
  ChevronDown: () => <span />,
  Pencil: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/modals/EditCourseModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/modals/EditTermModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/services/plan-service', () => ({
  createPlanTerm: jest.fn(),
  deletePlanTerm: jest.fn(),
  addPlannedCourse: jest.fn(),
  deletePlannedCourse: jest.fn(),
  markCourseCompleted: jest.fn(),
  updatePlanTerm: jest.fn(),
}));

describe('PlanViewClient', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;

  const plan = {
    id: 'plan-1',
    name: 'My Plan',
    description: 'Plan description',
    plan_terms: [
      {
        id: 'term-1',
        name: 'Fall 2024',
        term_type: 'Fall',
        year: 2024,
        display_order: 1,
        planned_courses: [
          {
            id: 'course-1',
            course_title: 'Intro to CS',
            course_code: 'CS101',
            credits: 3,
            is_completed: false,
            display_order: 1,
          },
        ],
      },
    ],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expands term and toggles course completion', async () => {
    const { container } = render(<PlanViewClient user={user} plan={plan} courses={[]} />);

    fireEvent.click(screen.getByText('Fall 2024'));
    expect(screen.getByText('Intro to CS')).toBeInTheDocument();

    const checkboxButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.className.includes('checkbox')
    );
    expect(checkboxButton).toBeTruthy();
    fireEvent.click(checkboxButton as HTMLButtonElement);

    await waitFor(() => {
      expect(markCourseCompleted).toHaveBeenCalledWith('course-1', true);
    });
  });

  it('opens create term modal and creates term', async () => {
    jest.useFakeTimers();
    const push = jest.fn();
    const refresh = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push,
      refresh,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    });

    (createPlanTerm as jest.Mock).mockResolvedValue({});

    render(<PlanViewClient user={user} plan={plan} courses={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /add term/i }));
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., fall 2024/i), { target: { value: 'Spring 2025' } });
    const addTermButtons = screen.getAllByRole('button', { name: /add term/i });
    fireEvent.click(addTermButtons[addTermButtons.length - 1]);

    await waitFor(() => {
      expect(createPlanTerm).toHaveBeenCalledWith('plan-1', {
        name: 'Spring 2025',
        term_type: 'Fall',
        year: expect.any(Number),
        credits_target: 15,
      });
      expect(refresh).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });
});
