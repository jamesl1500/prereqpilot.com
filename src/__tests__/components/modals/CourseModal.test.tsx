/**
 * Unit tests for CourseModal component
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockCourse, mockTerm } from '../../utils/test-helpers';
import CourseModal from '@/components/modals/CourseModal';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CourseModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    terms: [mockTerm],
    institutions: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.isAxiosError = jest.fn().mockReturnValue(false);
  });

  it('should render the modal when open', () => {
    renderWithProviders(<CourseModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(/add course/i).length).toBeGreaterThan(0);
  });

  it('should not render when closed', () => {
    renderWithProviders(<CourseModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display form fields', () => {
    renderWithProviders(<CourseModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/course title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^credits/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^term/i)).toBeInTheDocument();
  });

  it('should populate fields when editing', () => {
    const editCourse = {
      id: mockCourse.id,
      course_title: mockCourse.title,
      credits: mockCourse.credits,
      grade: mockCourse.grade,
      grade_value: 3.0,
      term_id: mockCourse.term_id,
      institution_id: '',
      notes: '',
    };
    
    renderWithProviders(<CourseModal {...defaultProps} course={editCourse} />);
    
    expect(screen.getByDisplayValue(mockCourse.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCourse.credits.toString())).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const { user } = renderWithProviders(<CourseModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /add course/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/course title is required/i)).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel is clicked', async () => {
    const { user } = renderWithProviders(<CourseModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', async () => {
    const { user } = renderWithProviders(<CourseModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    mockedAxios.post.mockResolvedValue({ data: mockCourse });

    const { user } = renderWithProviders(<CourseModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/course title/i), 'Intro to CS');
    await user.type(screen.getByLabelText(/^credits/i), '3');
    await user.type(screen.getByPlaceholderText(/e\.g\., A, B\+, C-, IP/i), 'A');
    await user.selectOptions(screen.getByLabelText(/^term/i), mockTerm.id);
    
    const submitButton = screen.getByRole('button', { name: /add course/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display error message on submission failure', async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { error: 'Failed to create course' } },
      isAxiosError: true,
      toJSON: () => ({}),
      name: 'AxiosError',
      message: 'Failed to create course',
    });
    mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

    const { user } = renderWithProviders(<CourseModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/course title/i), 'Intro to CS');
    
    // Clear and type credits (same as successful test)
    const creditsField = screen.getByLabelText(/^credits/i);
    await user.clear(creditsField);
    await user.type(creditsField, '3');
    
    // Add grade (same as successful test)
    await user.type(screen.getByPlaceholderText(/e\.g\., A, B\+, C-, IP/i), 'A');
    
    await user.selectOptions(screen.getByLabelText(/^term/i), mockTerm.id);
    
    const submitButton = screen.getByRole('button', { name: /add course/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to create course/i)).toBeInTheDocument();
    });
  });

});
