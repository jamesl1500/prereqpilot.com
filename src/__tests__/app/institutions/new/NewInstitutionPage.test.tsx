import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewInstitutionPage from '@/app/institutions/new/NewInstitutionPage';
import type { User } from '@supabase/supabase-js';
import axios from 'axios';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span />,
  Building2: () => <span />,
  Globe: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

describe('NewInstitutionPage', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/institution name/i), { target: { value: 'Test University' } });
    fireEvent.change(screen.getByLabelText(/short code/i), { target: { value: 'TU' } });
  };

  it('creates institution and advances onboarding to courses', async () => {
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

    (axios.post as jest.Mock).mockResolvedValue({});
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: {
          onboarding_completed: false,
          current_step: 'institutions',
          steps_completed: [],
        },
      },
    });
    (axios.put as jest.Mock).mockResolvedValue({});

    render(<NewInstitutionPage user={user} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /create institution/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith('/api/onboarding', {
        step: 'courses',
        steps_completed: ['institutions'],
      });
      expect(push).toHaveBeenCalledWith('/classes');
      expect(refresh).toHaveBeenCalled();
    });
  });

  it('creates institution and returns to institutions when onboarding not active', async () => {
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

    (axios.post as jest.Mock).mockResolvedValue({});
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: { onboarding_completed: true } } });

    render(<NewInstitutionPage user={user} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /create institution/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith('/institutions');
      expect(refresh).toHaveBeenCalled();
    });
  });
});
