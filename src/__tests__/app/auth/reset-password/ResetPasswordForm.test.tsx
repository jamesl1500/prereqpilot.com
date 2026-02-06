import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordForm from '@/app/(auth)/reset-password/ResetPasswordForm';

describe('ResetPasswordForm', () => {
  it('shows password mismatch error', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^new password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'Password2');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits when passwords match', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^new password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(onSubmit).toHaveBeenCalled();
    expect(screen.getByLabelText(/^new password/i)).toHaveValue('Password1');
    expect(screen.getByLabelText(/confirm new password/i)).toHaveValue('Password1');
  });
});
