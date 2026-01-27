/**
 * Integration tests for Scenario Planning Flow
 * Tests the complete user journey from creating a scenario to simulating courses
 */

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockScenario, mockCourse, mockUser } from '../utils/test-helpers';
import ScenariosPage from '@/app/scenarios/ScenariosPage';

describe('Scenario Planning Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful auth
    global.fetch = jest.fn((url) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('/api/scenarios')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [mockScenario] }),
        } as Response);
      }
      if (urlString.includes('/api/courses')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [mockCourse] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    });
  });

  it('should complete full scenario creation flow', async () => {
    const { user } = renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={null} />);

    // Step 1: Click create scenario button
    const createButton = await screen.findByRole('button', { name: /create scenario/i });
    await user.click(createButton);

    // Step 2: Fill in scenario details
    await waitFor(() => {
      expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/scenario name/i), 'Graduate Early');
    await user.type(screen.getByLabelText(/description/i), 'Planning to graduate one semester early');
    await user.type(screen.getByLabelText(/target gpa/i), '3.8');

    // Step 3: Submit scenario
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Step 4: Verify scenario was created
    await waitFor(() => {
      expect(screen.getByText('Graduate Early')).toBeInTheDocument();
    });
  });

  it('should allow adding courses to scenario', async () => {
    const { user } = renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={null} />);

    // Navigate to scenario details
    const scenarioCard = await screen.findByText(mockScenario.name);
    await user.click(scenarioCard);

    // Add a course
    const addCourseButton = await screen.findByRole('button', { name: /add course/i });
    await user.click(addCourseButton);

    // Fill course details
    await user.type(screen.getByLabelText(/course code/i), 'CS202');
    await user.type(screen.getByLabelText(/projected grade/i), 'A');

    const saveCourseButton = screen.getByRole('button', { name: /add/i });
    await user.click(saveCourseButton);

    // Verify course was added
    await waitFor(() => {
      expect(screen.getByText('CS202')).toBeInTheDocument();
    });
  });

  it('should calculate projected GPA correctly', async () => {
    const { user } = renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={null} />);

    // Navigate to scenario with courses
    const scenarioCard = await screen.findByText(mockScenario.name);
    await user.click(scenarioCard);

    // Verify GPA calculation is displayed
    await waitFor(() => {
      expect(screen.getByText(/projected gpa/i)).toBeInTheDocument();
      expect(screen.getByText(/3\.[5-9]/)).toBeInTheDocument(); // Should show GPA
    });
  });

  it('should handle scenario deletion', async () => {
    const { user } = renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={null} />);

    // Find and click delete button
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify scenario was removed
    await waitFor(() => {
      expect(screen.queryByText(mockScenario.name)).not.toBeInTheDocument();
    });
  });

  it('should show comparison with current GPA', async () => {
    const { user } = renderWithProviders(<ScenariosPage user={mockUser} scenarios={[mockScenario]} onboarding={null} />);

    const scenarioCard = await screen.findByText(mockScenario.name);
    await user.click(scenarioCard);

    // Should display both current and projected GPA
    await waitFor(() => {
      expect(screen.getByText(/current gpa/i)).toBeInTheDocument();
      expect(screen.getByText(/projected gpa/i)).toBeInTheDocument();
    });
  });
});
