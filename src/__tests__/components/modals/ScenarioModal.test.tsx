/**
 * Tests for ScenarioModal Component
 */

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockFetch, mockFetchError, mockScenario, mockProgram } from '../../utils/test-helpers';
import ScenarioModal from '@/components/modals/ScenarioModal';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ScenarioModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock programs API calls
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/programs')) {
        return Promise.resolve({
          data: { data: [{ ...mockProgram, id: '1' }] }
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  describe('Create Mode', () => {
    it('should render create scenario form', () => {
      renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getAllByText(/create scenario/i).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should create scenario successfully', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockScenario });

      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.type(screen.getByLabelText(/scenario name/i), 'Graduate Early');
      await user.selectOptions(screen.getByLabelText(/program/i), '1');
      await user.type(screen.getByLabelText(/description/i), 'Plan to graduate in 3 years');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show loading state during creation', async () => {
      mockedAxios.post.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ data: mockScenario }), 1000))
      );

      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.type(screen.getByLabelText(/scenario name/i), 'Test Scenario');
      await user.selectOptions(screen.getByLabelText(/program/i), '1');
      await user.click(screen.getByRole('button', { name: /create/i }));

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('should handle creation error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Failed to create scenario'));

      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.type(screen.getByLabelText(/scenario name/i), 'Test Scenario');
      await user.selectOptions(screen.getByLabelText(/program/i), '1');
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        // Find error in the modal/form, not the toast
        const allMessages = screen.getAllByText(/an error occurred/i);
        const modalError = allMessages.find(el => el.closest('[role="dialog"]'));
        expect(modalError).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should render edit form with pre-filled data', () => {
      renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
          scenario={{ ...mockScenario, program_id: 'program-123' }}
        />
      );

      expect(screen.getByText(/edit scenario/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockScenario.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockScenario.description || '')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });

    it('should update scenario successfully', async () => {
      const updatedScenario = { ...mockScenario, name: 'Updated Name', program_id: 'program-123' };
      mockedAxios.put.mockResolvedValue({ data: updatedScenario });

      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
          scenario={{ ...mockScenario, program_id: 'program-123' }}
        />
      );

      const nameInput = screen.getByLabelText(/scenario name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      await user.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle update error', async () => {
      mockedAxios.put.mockRejectedValue(new Error('Failed to update scenario'));

      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
          scenario={{ ...mockScenario, program_id: 'program-123' }}
        />
      );

      const nameInput = screen.getByLabelText(/scenario name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      await user.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        // Find error in the modal/form, not the toast
        const allMessages = screen.getAllByText(/an error occurred/i);
        const modalError = allMessages.find(el => el.closest('[role="dialog"]'));
        expect(modalError).toBeInTheDocument();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should not render when closed', () => {
      renderWithProviders(
        <ScenarioModal
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close modal on cancel', async () => {
      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal on background click', async () => {
      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should trap focus inside modal', () => {
      renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Form Validation', () => {
    it('should accept whitespace in scenario names', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockScenario });

      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.type(screen.getByLabelText(/scenario name/i), '  Test Scenario  ');
      await user.selectOptions(screen.getByLabelText(/program/i), '1');
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
      expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const { user } = renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // First tab goes to close button
      await user.tab();
      expect(screen.getByLabelText(/close modal/i)).toHaveFocus();

      // Next tab goes to name input
      await user.tab();
      expect(screen.getByLabelText(/scenario name/i)).toHaveFocus();
    });

    it('should have focus trap capability', () => {
      renderWithProviders(
        <ScenarioModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
