import React from 'react';
import { render, screen } from '@testing-library/react';
import EmailConfirmation from '@/app/(auth)/signup/EmailConfirmation';

describe('EmailConfirmation', () => {
  it('renders email and login link', () => {
    render(<EmailConfirmation email="user@example.com" />);

    expect(screen.getByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /back to login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
