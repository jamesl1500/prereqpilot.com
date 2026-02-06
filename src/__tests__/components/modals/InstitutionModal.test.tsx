import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InstitutionModal from '@/components/modals/InstitutionModal';
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

describe('InstitutionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits new institution and closes', async () => {
    const onClose = jest.fn();

    (axios.post as jest.Mock).mockResolvedValue({ data: { id: 'inst-1' } });
    (axios.get as jest.Mock).mockRejectedValue(new Error('skip onboarding'));

    render(
      <InstitutionModal
        isOpen={true}
        onClose={onClose}
        institution={undefined}
      />
    );

    fireEvent.change(screen.getByLabelText(/institution name/i), { target: { value: 'Test University' } });
    fireEvent.change(screen.getByLabelText(/short code/i), { target: { value: 'TU' } });

    fireEvent.click(screen.getByRole('button', { name: /add institution/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/institutions', {
        name: 'Test University',
        short_code: 'TU',
        country: null,
        website: null,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not render when closed', () => {
    const { container } = render(
      <InstitutionModal
        isOpen={false}
        onClose={jest.fn()}
        institution={undefined}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
