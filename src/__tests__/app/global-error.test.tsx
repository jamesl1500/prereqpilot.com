import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from '@/app/global-error';

jest.mock('lucide-react', () => ({
  PenTool: () => <span />,
}));

describe('GlobalError', () => {
  it('renders critical error UI and calls reset', () => {
    const reset = jest.fn();
    const error = new Error('Boom');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByText('Critical Error')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Global error:', error);

    consoleSpy.mockRestore();
  });

  it('links back to home', () => {
    render(<GlobalError error={new Error('Boom')} reset={jest.fn()} />);

    const homeLink = screen.getByRole('link', { name: /go to home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
