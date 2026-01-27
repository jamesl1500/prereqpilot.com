import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthErrorPage from '@/app/auth/error/page';
import PasswordUpdatedPage from '@/app/auth/password-updated/page';

describe('Auth status pages', () => {
  it('shows verification failure reasons and links', () => {
    render(<AuthErrorPage />);

    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /sign up again/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
  });

  it('shows password updated confirmation with login link', () => {
    render(<PasswordUpdatedPage />);

    expect(screen.getByText('Password Updated!')).toBeInTheDocument();
    expect(
      screen.getByText('Your password has been successfully changed. You can now sign in with your new password.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in to your account/i })).toHaveAttribute('href', '/login');
  });
});
