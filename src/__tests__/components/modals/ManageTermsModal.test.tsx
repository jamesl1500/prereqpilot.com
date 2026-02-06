import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ManageTermsModal from '@/components/modals/ManageTermsModal';

jest.mock('lucide-react', () => ({
  List: () => <span />,
  Plus: () => <span />,
}));

describe('ManageTermsModal', () => {
  const term = { id: 't1', name: 'Fall 2024', start_date: null, end_date: null } as any;

  it('shows menu and navigates to list view', () => {
    render(
      <ManageTermsModal
        isOpen={true}
        onClose={jest.fn()}
        onAddTerm={jest.fn()}
        onEditTerm={jest.fn()}
        onDeleteTerm={jest.fn()}
        terms={[term]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view and delete terms/i }));
    expect(screen.getByRole('button', { name: /back to menu/i })).toBeInTheDocument();
    expect(screen.getByText('Fall 2024')).toBeInTheDocument();
  });

  it('calls add/edit/delete handlers', () => {
    const onAddTerm = jest.fn();
    const onEditTerm = jest.fn();
    const onDeleteTerm = jest.fn();
    const onClose = jest.fn();

    render(
      <ManageTermsModal
        isOpen={true}
        onClose={onClose}
        onAddTerm={onAddTerm}
        onEditTerm={onEditTerm}
        onDeleteTerm={onDeleteTerm}
        terms={[term]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view and delete terms/i }));
    fireEvent.click(screen.getByRole('button', { name: /edit fall 2024/i }));

    expect(onEditTerm).toHaveBeenCalledWith(term);
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /view and delete terms/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete fall 2024/i }));

    expect(onDeleteTerm).toHaveBeenCalledWith(term);

    fireEvent.click(screen.getByRole('button', { name: /add new term/i }));
    expect(onAddTerm).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <ManageTermsModal
        isOpen={false}
        onClose={jest.fn()}
        onAddTerm={jest.fn()}
        onEditTerm={jest.fn()}
        onDeleteTerm={jest.fn()}
        terms={[]}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
