import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VerifiedPage from '@/app/auth/verified/VerifiedPage';
import type { User } from '@supabase/supabase-js';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUser: User = {
  id: 'user-123',
  email: 'verified@example.com',
  created_at: '2023-01-15T12:00:00Z',
  user_metadata: { name: 'Verified User' },
  app_metadata: {},
  aud: 'authenticated',
  confirmed_at: '2023-01-15T12:00:00Z',
  role: 'authenticated',
};

describe('VerifiedPage (client)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders user details and account info', () => {
    render(<VerifiedPage user={mockUser} />);

    expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    expect(screen.getByText(mockUser.email as string)).toBeInTheDocument();
    expect(screen.getByText('Verified User')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your email has been successfully verified. You can now access all features of PreReqPilot.'
      )
    ).toBeInTheDocument();
  });

  it('navigates to dashboard when continue is clicked', () => {
    render(<VerifiedPage user={mockUser} />);

    const router = require('next/navigation').useRouter();
    fireEvent.click(screen.getByRole('button', { name: /continue to dashboard/i }));

    expect(router.push).toHaveBeenCalledWith('/dashboard');
  });
});
