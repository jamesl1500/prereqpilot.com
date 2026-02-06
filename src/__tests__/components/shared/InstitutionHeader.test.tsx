import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InstitutionHeader from '@/components/shared/InstitutionHeader';
import type { User } from '@supabase/supabase-js';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || 'image'} />,
}));

jest.mock('lucide-react', () => ({
  PenTool: () => <span />,
  ChevronDown: () => <span />,
}));

describe('InstitutionHeader', () => {
  const user = { id: 'user-1', email: 'user@example.com' } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders navigation links and toggles dropdown', () => {
    render(<InstitutionHeader user={user} />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/institution/dashboard'
    );
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
      'href',
      '/institution/profile'
    );
    expect(screen.getByRole('link', { name: /programs/i })).toHaveAttribute(
      'href',
      '/institution/programs'
    );
    expect(screen.getByRole('link', { name: /courses/i })).toHaveAttribute(
      'href',
      '/institution/courses'
    );

    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    expect(screen.getByRole('link', { name: /manage staff/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('link', { name: /manage staff/i })).not.toBeInTheDocument();
  });

  it('logs out and redirects on success', async () => {
    const push = jest.fn();
    const refresh = jest.fn();

    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push,
      refresh,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    });

    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;

    render(<InstitutionHeader user={user} />);

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/');
      expect(refresh).toHaveBeenCalled();
    });
  });
});
