import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditInstitutionPage from '@/app/institutions/[id]/edit/EditInstitutionPage';
import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types';
import axios from 'axios';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span />,
  Building2: () => <span />,
  Globe: () => <span />,
  Check: () => <span />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

describe('EditInstitutionPage', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;
  const institution = {
    id: 'inst-1',
    name: 'Test University',
    short_code: 'TU',
    country: 'USA',
    website: 'https://example.edu',
  } as Institution;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits form and redirects', async () => {
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

    (axios.put as jest.Mock).mockResolvedValue({});

    render(<EditInstitutionPage user={user} institution={institution} />);

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/institutions/inst-1', {
        name: 'Test University',
        short_code: 'TU',
        country: 'USA',
        website: 'https://example.edu',
      });
    });

    jest.runAllTimers();

    expect(push).toHaveBeenCalledWith('/institutions/inst-1');
    expect(refresh).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('routes back on cancel', () => {
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

    render(<EditInstitutionPage user={user} institution={institution} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(push).toHaveBeenCalledWith('/institutions/inst-1');
  });
});
