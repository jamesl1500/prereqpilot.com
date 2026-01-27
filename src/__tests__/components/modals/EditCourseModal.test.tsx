/**
 * Unit tests for EditCourseModal component
 */

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-helpers';
import EditCourseModal from '@/components/modals/EditCourseModal';
import { PlannedCourse } from '@/types';
import * as planService from '@/services/plan-service';

jest.mock('@/services/plan-service');
const mockedPlanService = planService as jest.Mocked<typeof planService>;

describe('EditCourseModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  const mockPlannedCourse: PlannedCourse = {
    id: '1',
    plan_term_id: 'term-1',
    course_id: 'course-1',
    course_title: 'Introduction to Computer Science',
    course_code: 'CS101',
    credits: 3,
    notes: null,
    is_completed: false,
    taken_course_id: null,
    display_order: 0,
    updated_at: '2023-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onUpdate: mockOnUpdate,
    course: mockPlannedCourse,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedPlanService.updatePlannedCourse.mockResolvedValue(undefined);
  });

  it('should render the modal when open', () => {
    renderWithProviders(<EditCourseModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/edit course/i)).toBeInTheDocument();
  });

  it('should populate fields with course data', () => {
    renderWithProviders(<EditCourseModal {...defaultProps} />);
    
    expect(screen.getByDisplayValue(mockPlannedCourse.course_code!)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPlannedCourse.course_title!)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockPlannedCourse.credits!.toString())).toBeInTheDocument();
  });

  it('should update course on form submission', async () => {
    const { user } = renderWithProviders(<EditCourseModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/course title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Course Title');
    
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel is clicked', async () => {
    const { user } = renderWithProviders(<EditCourseModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should validate required course title', async () => {
    const { user } = renderWithProviders(<EditCourseModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/course title/i);
    await user.clear(titleInput);
    
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when title is empty', () => {
    const courseWithoutTitle = {
      ...mockPlannedCourse,
      course_title: '',
    };

    renderWithProviders(
      <EditCourseModal {...defaultProps} course={courseWithoutTitle} />
    );
    
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    expect(submitButton).toBeDisabled();
  });
});
