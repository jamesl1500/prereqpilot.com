import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProgramDetailPage from '@/app/programs/[id]/ProgramDetailPage';
import type { User } from '@supabase/supabase-js';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span />,
  Plus: () => <span />,
  Edit: () => <span />,
  Trash2: () => <span />,
  BookOpen: () => <span />,
  GraduationCap: () => <span />,
  Target: () => <span />,
  Link: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

describe('ProgramDetailPage', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;
  const program = {
    id: 'prog-1',
    name: 'Nursing Program',
    min_prereq_gpa: 3.0,
    min_overall_gpa: 2.8,
    required_count: 1,
    optional_count: 0,
    total_credits: 3,
    required_courses: [
      {
        id: 'course-1',
        course_title: 'Biology',
        course_code: 'BIO101',
        credits: 3,
        min_grade: 'C',
        is_required: true,
        category: 'Science',
      },
    ],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as jest.Mock;
  });

  it('renders required courses', () => {
    render(<ProgramDetailPage program={program} isOwner={true} user={user} />);

    expect(screen.getByRole('heading', { name: /required courses/i })).toBeInTheDocument();
    expect(screen.getByText('Biology')).toBeInTheDocument();
  });

  it('deletes a required course', async () => {
    window.confirm = jest.fn().mockReturnValue(true);

    render(<ProgramDetailPage program={program} isOwner={true} user={user} />);

    fireEvent.click(screen.getByTitle('Delete course'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/programs/prog-1/courses/course-1', {
        method: 'DELETE',
      });
    });
  });

  it('opens add course modal', () => {
    render(<ProgramDetailPage program={program} isOwner={true} user={user} />);

    fireEvent.click(screen.getByRole('button', { name: /add required course/i }));
    expect(screen.getByRole('heading', { name: /add required course/i })).toBeInTheDocument();
  });
});
