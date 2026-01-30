/**
 * Unit tests for DeleteModal component
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/utils/test-helpers';
import DeleteModal from '@/components/modals/DeleteModal';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create mock router functions that we can reference
const mockRefresh = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('DeleteModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    renderWithProviders(
      <DeleteModal
        isOpen={false}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    expect(screen.getByText('Delete course')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('should display correct item type in title', () => {
    const itemTypes: Array<'course' | 'institution' | 'program' | 'scenario' | 'term'> = 
      ['course', 'institution', 'program', 'scenario', 'term'];

    itemTypes.forEach(itemType => {
      const { unmount } = renderWithProviders(
        <DeleteModal
          isOpen={true}
          onClose={mockOnClose}
          itemType={itemType}
          itemId="123"
          itemName="Test Item"
        />
      );

      expect(screen.getByText(`Delete ${itemType}`)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button (×) is clicked', () => {
    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    const overlay = screen.getByText('Delete course').closest('.overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should not close when modal content is clicked', () => {
    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    const modalContent = screen.getByText('Delete course').closest('.modal');
    if (modalContent) {
      fireEvent.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('should successfully delete course and close modal', async () => {
    mockedAxios.delete.mockResolvedValue({});

    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="course-123"
        itemName="Test Course"
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/courses/course-123');
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle different item types with correct API endpoints', async () => {
    mockedAxios.delete.mockResolvedValue({});

    const testCases = [
      { itemType: 'course' as const, endpoint: '/api/courses/123' },
      { itemType: 'institution' as const, endpoint: '/api/institutions/123' },
      { itemType: 'program' as const, endpoint: '/api/programs/123' },
      { itemType: 'scenario' as const, endpoint: '/api/scenarios/123' },
      { itemType: 'term' as const, endpoint: '/api/terms/123' },
    ];

    for (const testCase of testCases) {
      const { unmount } = renderWithProviders(
        <DeleteModal
          isOpen={true}
          onClose={mockOnClose}
          itemType={testCase.itemType}
          itemId="123"
          itemName="Test Item"
        />
      );

      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(testCase.endpoint);
      });

      unmount(); // Cleanup
      mockedAxios.delete.mockClear();
    }
  });

  it('should display error message when delete fails', async () => {
    mockedAxios.delete.mockRejectedValue({
      response: { data: { error: 'Failed to delete item' } },
      isAxiosError: true,
      toJSON: () => ({}),
      name: 'AxiosError',
      message: 'Failed to delete item',
    });
    mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // Look for all alerts and find the one with aria-live="assertive"
      const errorDivs = screen.getAllByRole('alert', { hidden: false });
      const modalErrorDiv = errorDivs.find(el => el.getAttribute('aria-live') === 'assertive');
      expect(modalErrorDiv).toHaveTextContent('Failed to delete item');
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state during deletion', async () => {
    mockedAxios.delete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('should handle generic error when axios error is not recognized', async () => {
    mockedAxios.delete.mockRejectedValue(new Error('Network error'));

    renderWithProviders(
      <DeleteModal
        isOpen={true}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
