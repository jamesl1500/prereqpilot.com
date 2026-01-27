/**
 * Unit tests for TermModal component
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockTerm } from '../../utils/test-helpers';
import TermModal from '@/components/modals/TermModal';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TermModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.isAxiosError = jest.fn().mockReturnValue(false);
  });

  it('should render the modal when open', () => {
    renderWithProviders(<TermModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(/add term/i).length).toBeGreaterThan(0);
  });

  it('should display all form fields', () => {
    renderWithProviders(<TermModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/term name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('should populate fields when editing', () => {
    renderWithProviders(<TermModal {...defaultProps} term={mockTerm} />);
    
    expect(screen.getByDisplayValue(mockTerm.name)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const { user } = renderWithProviders(<TermModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /add term/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/term name is required/i)).toBeInTheDocument();
    });
  });

  it('should successfully create a term', async () => {
    mockedAxios.post.mockResolvedValue({ data: mockTerm });

    const { user } = renderWithProviders(<TermModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/term name/i), 'Fall 2024');
    await user.type(screen.getByLabelText(/start date/i), '2024-09-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-12-15');
    
    const submitButton = screen.getByRole('button', { name: /add term/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { error: 'Term already exists' } },
      isAxiosError: true,
      toJSON: () => ({}),
      name: 'AxiosError',
      message: 'Term already exists',
    });
    mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

    const { user } = renderWithProviders(<TermModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/term name/i), 'Fall 2024');
    await user.type(screen.getByLabelText(/start date/i), '2024-09-01');
    await user.type(screen.getByLabelText(/end date/i), '2024-12-15');
    
    const submitButton = screen.getByRole('button', { name: /add term/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/term already exists/i)).toBeInTheDocument();
    });
  });

  it('should allow cancelling', async () => {
    const { user } = renderWithProviders(<TermModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
