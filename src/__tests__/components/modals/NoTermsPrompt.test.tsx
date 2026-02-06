import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NoTermsPrompt from '@/components/modals/NoTermsPrompt';

jest.mock('lucide-react', () => ({
  Calendar: () => <span />,
}));

describe('NoTermsPrompt', () => {
  it('renders and triggers actions', () => {
    const onClose = jest.fn();
    const onCreateTerm = jest.fn();

    render(
      <NoTermsPrompt
        isOpen={true}
        onClose={onClose}
        onCreateTerm={onCreateTerm}
      />
    );

    expect(screen.getByText('Terms Required')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /create your first term/i }));
    expect(onCreateTerm).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <NoTermsPrompt isOpen={false} onClose={jest.fn()} onCreateTerm={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
