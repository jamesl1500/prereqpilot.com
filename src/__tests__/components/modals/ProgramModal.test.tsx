import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProgramModal from '@/components/modals/ProgramModal';
import axios from 'axios';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

jest.mock('@/components/shared/Toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

describe('ProgramModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits new program and closes', async () => {
    const onClose = jest.fn();

    (axios.post as jest.Mock).mockResolvedValue({ data: { id: 'prog-1' } });
    (axios.get as jest.Mock).mockRejectedValue(new Error('skip onboarding'));

    render(
      <ProgramModal
        isOpen={true}
        onClose={onClose}
        program={undefined}
        userInstitutions={[]}
        allInstitutions={[]}
      />
    );

    fireEvent.change(screen.getByLabelText(/program name/i), { target: { value: 'Nursing' } });
    fireEvent.change(screen.getByLabelText(/min prerequisite gpa/i), { target: { value: '3.5' } });
    fireEvent.change(screen.getByLabelText(/min overall gpa/i), { target: { value: '3.2' } });
    fireEvent.click(screen.getByRole('button', { name: /add program/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/programs', {
        name: 'Nursing',
        institution_id: null,
        min_prereq_gpa: 3.5,
        min_overall_gpa: 3.2,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows import validation error for empty url', () => {
    render(
      <ProgramModal
        isOpen={true}
        onClose={jest.fn()}
        program={undefined}
        userInstitutions={[]}
        allInstitutions={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /import/i }));
    expect(screen.getByText(/please enter a valid website url/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <ProgramModal
        isOpen={false}
        onClose={jest.fn()}
        program={undefined}
        userInstitutions={[]}
        allInstitutions={[]}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
