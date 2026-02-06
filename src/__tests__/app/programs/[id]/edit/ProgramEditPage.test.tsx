import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProgramEditPage from '@/app/programs/[id]/edit/ProgramEditPage';
import type { User } from '@supabase/supabase-js';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span />,
  Plus: () => <span />,
  Edit: () => <span />,
  Trash2: () => <span />,
  Save: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

describe('ProgramEditPage', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;
  const program = {
    id: 'prog-1',
    name: 'Nursing Program',
    institution_id: 'inst-1',
    min_prereq_gpa: 3.0,
    min_overall_gpa: 2.8,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as jest.Mock;
  });

  it('saves program information', async () => {
    render(
      <ProgramEditPage
        program={program}
        requiredCourses={[]}
        user={user}
        userInstitutions={[]}
        officialInstitutions={[]}
      />
    );

    fireEvent.change(screen.getByLabelText(/program name/i), { target: { value: 'Updated Program' } });
    fireEvent.click(screen.getByRole('button', { name: /save program info/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/programs/prog-1?type=requirement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Program',
          institution_id: 'inst-1',
          min_prereq_gpa: 3.0,
          min_overall_gpa: 2.8,
        }),
      });
    });
  });

  it('switches to courses tab and opens modal', () => {
    render(
      <ProgramEditPage
        program={program}
        requiredCourses={[]}
        user={user}
        userInstitutions={[]}
        officialInstitutions={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /courses/i }));
    expect(screen.getByText('Required Courses (Prerequisites)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add course/i }));
    expect(screen.getByText('Add Required Course')).toBeInTheDocument();
  });
});
