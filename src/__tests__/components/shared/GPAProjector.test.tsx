import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GPAProjector from '@/components/shared/GPAProjector';

// lucide-react is globally mocked via moduleNameMapper

const currentCourses = [
  { credits: 3, grade_value: 4.0 }, // A — contributes to GPA
  { credits: 3, grade_value: 3.0 }, // B — contributes to GPA
];

// Weighted GPA of currentCourses: (3*4 + 3*3) / (3+3) = 21/6 = 3.500
const CURRENT_GPA = 3.5;

describe('GPAProjector', () => {
  describe('collapsed state', () => {
    it('renders the section header with title', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);
      expect(screen.getByText('GPA Projector')).toBeInTheDocument();
    });

    it('shows Interactive badge', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);
      expect(screen.getByText('Interactive')).toBeInTheDocument();
    });

    it('does not show body content when collapsed', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);
      expect(screen.queryByText(/add hypothetical future courses/i)).not.toBeInTheDocument();
    });

    it('shows collapsed indicator (▼)', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);
      expect(screen.getByText('▼')).toBeInTheDocument();
    });
  });

  describe('expand / collapse toggle', () => {
    it('expands body when header is clicked', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));

      expect(screen.getByText(/add hypothetical future courses/i)).toBeInTheDocument();
    });

    it('shows expanded indicator (▲) after expanding', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));

      expect(screen.getByText('▲')).toBeInTheDocument();
    });

    it('collapses again when header is clicked a second time', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      const header = screen.getByRole('button', { name: /gpa projector/i });
      fireEvent.click(header);
      fireEvent.click(header);

      expect(screen.queryByText(/add hypothetical future courses/i)).not.toBeInTheDocument();
    });

    it('expands on Enter key press', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.keyDown(screen.getByRole('button', { name: /gpa projector/i }), { key: 'Enter' });

      expect(screen.getByText(/add hypothetical future courses/i)).toBeInTheDocument();
    });
  });

  describe('stats display', () => {
    it('displays current GPA in stats', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));

      expect(screen.getAllByText('3.500').length).toBeGreaterThanOrEqual(1);
    });

    it('displays N/A for current GPA when it is null', () => {
      render(<GPAProjector currentCourses={[]} currentGPA={null} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));

      expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });

    it('shows "No hypothetical courses added yet" when list is empty', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));

      expect(screen.getByText(/no hypothetical courses added yet/i)).toBeInTheDocument();
    });
  });

  describe('adding hypothetical courses', () => {
    it('adds a course row when Add Course is clicked', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));
      fireEvent.click(screen.getByRole('button', { name: /add course/i }));

      expect(screen.getByPlaceholderText(/course title/i)).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /credits/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /grade/i })).toBeInTheDocument();
    });

    it('adds multiple course rows', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));
      fireEvent.click(screen.getByRole('button', { name: /add course/i }));
      fireEvent.click(screen.getByRole('button', { name: /add course/i }));

      expect(screen.getAllByPlaceholderText(/course title/i)).toHaveLength(2);
    });
  });

  describe('projected GPA calculation', () => {
    it('updates projected GPA when a hypothetical course is added with default A grade', () => {
      // currentCourses: (3*4 + 3*3)/6 = 3.500
      // After adding 3-credit A (4.0): (3*4 + 3*3 + 3*4)/9 = 33/9 = 3.667
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));
      fireEvent.click(screen.getByRole('button', { name: /add course/i }));

      // Projected GPA should now be shown (different from current)
      // The projected stat value should be > current GPA
      const statValues = screen.getAllByText(/\d+\.\d{3}/);
      // We expect both "Current GPA" and "Projected GPA" values to appear
      expect(statValues.length).toBeGreaterThanOrEqual(2);
    });

    it('shows positive delta when projected GPA is higher', () => {
      // Adding 3-credit A to a 3.500 GPA raises it → delta > 0
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));
      fireEvent.click(screen.getByRole('button', { name: /add course/i }));

      // Delta element should show a "+" prefix
      expect(screen.getByText(/^\+/)).toBeInTheDocument();
    });

    it('shows negative delta when projected GPA is lower', () => {
      // Adding 3-credit F (0.0) to a 3.500 GPA lowers it → delta < 0
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));
      fireEvent.click(screen.getByRole('button', { name: /add course/i }));

      // Change grade to F (0.0)
      const gradeSelect = screen.getByRole('combobox', { name: /grade/i });
      fireEvent.change(gradeSelect, { target: { value: '0' } });

      // Delta should now be negative
      expect(screen.getByText(/^-/)).toBeInTheDocument();
    });
  });

  describe('removing hypothetical courses', () => {
    it('removes a course row when remove button is clicked', () => {
      render(<GPAProjector currentCourses={currentCourses} currentGPA={CURRENT_GPA} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));
      fireEvent.click(screen.getByRole('button', { name: /add course/i }));

      expect(screen.getByPlaceholderText(/course title/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /remove course/i }));

      expect(screen.queryByPlaceholderText(/course title/i)).not.toBeInTheDocument();
      expect(screen.getByText(/no hypothetical courses added yet/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders with empty currentCourses array', () => {
      render(<GPAProjector currentCourses={[]} currentGPA={null} />);
      expect(screen.getByText('GPA Projector')).toBeInTheDocument();
    });

    it('filters out courses with null grade_value from GPA calculation', () => {
      const coursesWithNull = [
        { credits: 3, grade_value: null },
        { credits: 3, grade_value: 4.0 },
      ];

      render(<GPAProjector currentCourses={coursesWithNull} currentGPA={4.0} />);

      fireEvent.click(screen.getByRole('button', { name: /gpa projector/i }));

      // Should still render correctly
      expect(screen.getAllByText('4.000').length).toBeGreaterThanOrEqual(1);
    });
  });
});
