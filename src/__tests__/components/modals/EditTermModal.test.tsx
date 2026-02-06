import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditTermModal from '@/components/modals/EditTermModal';

describe('EditTermModal', () => {
  const baseTerm = {
    id: 'term-1',
    name: 'Fall 2024',
    term_type: 'Fall' as const,
    year: 2024,
    credits_target: 15,
    notes: 'Notes',
  };

  it('renders when open and submits updates', async () => {
    const onClose = jest.fn();
    const onUpdate = jest.fn().mockResolvedValue(undefined);

    render(
      <EditTermModal
        isOpen={true}
        onClose={onClose}
        term={baseTerm}
        onUpdate={onUpdate}
      />
    );

    fireEvent.change(screen.getByLabelText(/term name/i), { target: { value: 'Spring 2025' } });
    fireEvent.click(screen.getByRole('button', { name: /update term/i }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('term-1', expect.objectContaining({
        name: 'Spring 2025',
        term_type: 'Fall',
        year: 2024,
        credits_target: 15,
        notes: 'Notes',
      }));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('shows validation error when name is empty', async () => {
    render(
      <EditTermModal
        isOpen={true}
        onClose={jest.fn()}
        term={baseTerm}
        onUpdate={jest.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/term name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /update term/i }));

    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not render when closed', () => {
    const { container } = render(
      <EditTermModal
        isOpen={false}
        onClose={jest.fn()}
        term={baseTerm}
        onUpdate={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
