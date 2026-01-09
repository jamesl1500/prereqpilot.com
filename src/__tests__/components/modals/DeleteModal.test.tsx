/**
 * Unit tests for DeleteModal component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteModal from '@/components/modals/DeleteModal';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DeleteModal Component', () => {
  const mockOnClose = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: jest.fn(),
      refresh: mockRefresh,
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    });
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DeleteModal
        isOpen={false}
        onClose={mockOnClose}
        itemType="course"
        itemId="123"
        itemName="Test Course"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
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
      const { rerender } = render(
        <DeleteModal
          isOpen={true}
          onClose={mockOnClose}
          itemType={itemType}
          itemId="123"
          itemName="Test Item"
        />
      );

      expect(screen.getByText(`Delete ${itemType}`)).toBeInTheDocument();
      
      rerender(<div />); // Cleanup
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
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
    render(
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
    render(
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
    render(
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

    render(
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
      const { rerender } = render(
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

      rerender(<div />); // Cleanup
      mockedAxios.delete.mockClear();
    }
  });

  it('should display error message when delete fails', async () => {
    mockedAxios.delete.mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: 'Failed to delete item' } },
    });

    render(
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
      expect(screen.getByText('Failed to delete item')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state during deletion', async () => {
    mockedAxios.delete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
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

    render(
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
