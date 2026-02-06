import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewInstitutionPage from '@/app/institutions/[id]/ViewInstitutionPage';
import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types';
import axios from 'axios';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span />,
  Building2: () => <span />,
  Globe: () => <span />,
  MapPin: () => <span />,
  BookOpen: () => <span />,
  GraduationCap: () => <span />,
  Edit: () => <span />,
  Trash2: () => <span />,
  ExternalLink: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
  },
}));

describe('ViewInstitutionPage', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;
  const institution = {
    id: 'inst-1',
    name: 'Test University',
    short_code: 'TU',
    country: 'USA',
    website_url: 'https://example.edu',
    website: 'https://example.edu',
    is_official: false,
    status: 'custom',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Institution;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders institution details and stats', () => {
    render(
      <ViewInstitutionPage
        user={user}
        institution={institution}
        isOwner={true}
        userCourses={[]}
        officialCourses={[]}
        programs={[]}
      />
    );

    expect(screen.getByText('Test University')).toBeInTheDocument();
    expect(screen.getByText('Courses Taken')).toBeInTheDocument();
  });

  it('disables delete when courses exist', () => {
    render(
      <ViewInstitutionPage
        user={user}
        institution={institution}
        isOwner={true}
        userCourses={[{ id: 'course-1', course_title: 'Course', credits: 3, grade: 'A', grade_value: 4 }]}
        officialCourses={[]}
        programs={[]}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });

  it('deletes institution when confirmed', async () => {
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

    (axios.delete as jest.Mock).mockResolvedValue({});

    render(
      <ViewInstitutionPage
        user={user}
        institution={institution}
        isOwner={true}
        userCourses={[]}
        officialCourses={[]}
        programs={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/institutions/inst-1');
      expect(push).toHaveBeenCalledWith('/institutions');
      expect(refresh).toHaveBeenCalled();
    });
  });
});
