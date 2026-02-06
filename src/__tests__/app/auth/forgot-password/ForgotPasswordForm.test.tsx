import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '@/app/(auth)/forgot-password/ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid email', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      const callArgs = onSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({ email: 'user@example.com' });
    });
  });
});
