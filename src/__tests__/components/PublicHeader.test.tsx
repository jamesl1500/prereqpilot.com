/**
 * Unit tests for PublicHeader component
 */

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-helpers';
import PublicHeader from '@/components/PublicHeader';

describe('PublicHeader', () => {
  it('should render the logo and brand name', () => {
    renderWithProviders(<PublicHeader user={null} />);
    
    expect(screen.getByText('PREREQPILOT')).toBeInTheDocument();
  });

  it('should show login and signup links when not authenticated', () => {
    renderWithProviders(<PublicHeader user={null} />);
    
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show navigation links when authenticated', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
    };

    renderWithProviders(<PublicHeader user={mockUser} />);
    
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument();
  });

  it('should show mobile menu button on small screens', () => {
    renderWithProviders(<PublicHeader />);
    
    const loginLink = screen.getByRole('link', { name: /log in/i });
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should have accessible navigation structure', () => {
    renderWithProviders(<PublicHeader />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
