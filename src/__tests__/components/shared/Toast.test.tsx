import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/shared/Toast';

jest.mock('lucide-react', () => ({
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  Info: () => <span data-testid="icon-info" />,
}));

function TestComponent() {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Saved!', 'success')}>Show Toast</button>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders and dismisses toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /show toast/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Saved!');

    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('auto-removes toast after timeout', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /show toast/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
