/**
 * Unit tests for SignupForm component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '@/components/forms/SignupForm';

describe('SignupForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByText('Start planning your academic journey today')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password\s*\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should display password requirements hint', () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/must contain uppercase, lowercase, and a number/i)).toBeInTheDocument();
  });

  it('should render login link', () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    const loginLink = screen.getByText(/sign in/i);
    expect(loginLink).toBeInTheDocument();
    // Next.js Link is mocked in jest.setup.ts and doesn't render as <a> in tests
  });

  it('should display error message when provided', () => {
    const errorMessage = 'Email already exists';
    render(<SignupForm onSubmit={mockOnSubmit} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should validate full name field', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    
    const nameInput = screen.getByLabelText(/full name/i);

    fireEvent.focus(nameInput);
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'J');
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should validate email field', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/email address/i);

    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should validate password complexity', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText(/^password\s*\*/i);

    // Test password without uppercase
    await userEvent.type(passwordInput, 'password123');
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
    });
  });

  it('should validate password confirmation', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText(/^password\s*\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(passwordInput, 'Password123');
    await userEvent.type(confirmPasswordInput, 'DifferentPassword123');
    fireEvent.blur(confirmPasswordInput);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<SignupForm onSubmit={mockOnSubmit} />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password\s*\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(passwordInput, 'Password123');
    await userEvent.type(confirmPasswordInput, 'Password123');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    });
  });

  it('should show loading state when isLoading is true', () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /creating account/i });
    expect(submitButton).toBeDisabled();
  });

  it('should not show loading state when isLoading is false', () => {
    render(<SignupForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should have proper input attributes', () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password\s*\*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput).toHaveAttribute('placeholder', 'John Doe');
    expect(nameInput).toHaveAttribute('autoComplete', 'name');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
  });

  it('should validate minimum password length', async () => {
    render(<SignupForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText(/^password\s*\*/i);

    await userEvent.type(passwordInput, 'Pass1');
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
