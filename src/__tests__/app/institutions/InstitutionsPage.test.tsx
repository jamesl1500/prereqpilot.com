import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InstitutionsPage from '@/app/institutions/InstitutionsPage';
import type { Institution } from '@/types';
import type { User } from '@supabase/supabase-js';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || 'image'} />,
}));

jest.mock('lucide-react', () => ({
  Search: () => <span data-testid="icon-search" />,
  Building2: () => <span data-testid="icon-building" />,
  Globe: () => <span data-testid="icon-globe" />,
  MapPin: () => <span data-testid="icon-map" />,
  Plus: () => <span data-testid="icon-plus" />,
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/onboarding/TutorialTooltip', () => ({
  __esModule: true,
  default: () => <div data-testid="tutorial-tooltip" />,
}));

jest.mock('@/components/onboarding/OnboardingModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="onboarding-modal" /> : null),
}));

describe('InstitutionsPage', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;

  const baseInstitution: Institution = {
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
    logo_url: null,
    courses: [{ count: 2 }],
  } as Institution;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state and routes to new institution', () => {
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
      <InstitutionsPage
        user={user}
        userInstitutions={[]}
        officialInstitutions={[]}
        onboarding={null}
      />
    );

    expect(screen.getByText('No institutions yet')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add institution/i }));
    expect(push).toHaveBeenCalledWith('/institutions/new');
  });

  it('renders user institutions and view details action', () => {
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
      <InstitutionsPage
        user={user}
        userInstitutions={[baseInstitution]}
        officialInstitutions={[]}
        onboarding={null}
      />
    );

    expect(screen.getByText('Your Institutions')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    expect(push).toHaveBeenCalledWith('/institutions/inst-1');
  });

  it('renders official institutions when enabled', () => {
    process.env.NEXT_ENABLE_OFFICIAL_INSTITUTIONS = 'true';

    render(
      <InstitutionsPage
        user={user}
        userInstitutions={[]}
        officialInstitutions={[{ ...baseInstitution, id: 'official-1', is_official: true, status: 'verified' }]}
        onboarding={null}
      />
    );

    expect(screen.getByText('Official Institutions')).toBeInTheDocument();
  });
});
