import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RetakeAnalyzer from '@/components/shared/RetakeAnalyzer';

// lucide-react is globally mocked via moduleNameMapper

const makeCourse = (
  id: string,
  title: string,
  credits: number,
  grade: string,
  gradeValue: number | null,
  isRetaken = false
) => ({
  id,
  course_title: title,
  credits,
  grade,
  grade_value: gradeValue,
  is_retaken: isRetaken,
});

describe('RetakeAnalyzer', () => {
  describe('returns null for insufficient data', () => {
    it('renders nothing when courses array is empty', () => {
      const { container } = render(<RetakeAnalyzer courses={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when all courses have null grade_value', () => {
      const courses = [makeCourse('c1', 'Math', 3, 'W', null)];
      const { container } = render(<RetakeAnalyzer courses={courses} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when all courses have 4.0 grade (no room to improve)', () => {
      const courses = [
        makeCourse('c1', 'Math', 3, 'A', 4.0),
        makeCourse('c2', 'Science', 4, 'A+', 4.0),
      ];
      const { container } = render(<RetakeAnalyzer courses={courses} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when only credit=0 courses exist', () => {
      const courses = [makeCourse('c1', 'Pass/Fail', 0, 'B', 3.0)];
      const { container } = render(<RetakeAnalyzer courses={courses} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('collapsed state', () => {
    const courses = [
      makeCourse('c1', 'Calculus I', 3, 'C', 2.0),
      makeCourse('c2', 'Physics', 4, 'B', 3.0),
    ];

    it('renders the Retake Impact Analyzer heading', () => {
      render(<RetakeAnalyzer courses={courses} />);
      expect(screen.getByText('Retake Impact Analyzer')).toBeInTheDocument();
    });

    it('shows candidate count badge', () => {
      render(<RetakeAnalyzer courses={courses} />);
      // Both courses are below 4.0, so badge should say "2 candidates"
      expect(screen.getByText(/candidates/i)).toBeInTheDocument();
    });

    it('does not show the table when collapsed', () => {
      render(<RetakeAnalyzer courses={courses} />);
      expect(screen.queryByText(/course/i)).not.toBeInTheDocument();
      // "Course" header from the table head should not be present
      expect(screen.queryByText(/projected gpa/i)).not.toBeInTheDocument();
    });
  });

  describe('expand / collapse toggle', () => {
    const courses = [
      makeCourse('c1', 'Calculus I', 3, 'C', 2.0),
    ];

    it('expands body when header is clicked', () => {
      render(<RetakeAnalyzer courses={courses} />);

      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      expect(screen.getByText(/projected gpa/i)).toBeInTheDocument();
    });

    it('collapses again when header is clicked a second time', () => {
      render(<RetakeAnalyzer courses={courses} />);

      const btn = screen.getByRole('button', { name: /retake impact analyzer/i });
      fireEvent.click(btn);
      fireEvent.click(btn);

      expect(screen.queryByText(/projected gpa/i)).not.toBeInTheDocument();
    });

    it('expands on Enter key press', () => {
      render(<RetakeAnalyzer courses={courses} />);

      fireEvent.keyDown(screen.getByRole('button', { name: /retake impact analyzer/i }), { key: 'Enter' });

      expect(screen.getByText(/projected gpa/i)).toBeInTheDocument();
    });
  });

  describe('table content', () => {
    const courses = [
      makeCourse('c1', 'Calculus I', 3, 'C', 2.0),
      makeCourse('c2', 'Physics', 4, 'B', 3.0),
    ];

    const openAnalyzer = () => {
      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));
    };

    it('shows correct table headers', () => {
      openAnalyzer();

      expect(screen.getByText('Course')).toBeInTheDocument();
      expect(screen.getByText('Credits')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Projected GPA')).toBeInTheDocument();
      expect(screen.getByText('Impact')).toBeInTheDocument();
    });

    it('shows course names in the table', () => {
      openAnalyzer();

      expect(screen.getByText('Calculus I')).toBeInTheDocument();
      expect(screen.getByText('Physics')).toBeInTheDocument();
    });

    it('shows current grades in the table', () => {
      openAnalyzer();

      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('shows impact deltas with + prefix', () => {
      openAnalyzer();

      const impacts = screen.getAllByText(/^\+\d+\.\d{3}$/);
      expect(impacts.length).toBeGreaterThan(0);
    });

    it('shows current GPA in the hint text', () => {
      openAnalyzer();

      // GPA of [3cr C(2.0), 4cr B(3.0)] = (6+12)/7 = 18/7 ≈ 2.571
      expect(screen.getByText(/current gpa/i)).toBeInTheDocument();
    });
  });

  describe('ranking and ordering', () => {
    it('places the course with highest GPA impact first', () => {
      // A low-grade high-credit course has bigger impact than a low-grade low-credit course
      const courses = [
        makeCourse('c1', 'Light Course', 1, 'C', 2.0),   // small impact
        makeCourse('c2', 'Heavy Course', 6, 'C', 2.0),   // large impact
      ];

      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      const rows = screen.getAllByText(/^\+\d+\.\d{3}$/);
      // First impact should be larger than second
      const firstDelta = parseFloat(rows[0].textContent!.replace('+', ''));
      const secondDelta = parseFloat(rows[1].textContent!.replace('+', ''));
      expect(firstDelta).toBeGreaterThanOrEqual(secondDelta);
    });

    it('shows TOP badge on the first candidate', () => {
      const courses = [makeCourse('c1', 'Calculus I', 3, 'D', 1.0)];

      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      expect(screen.getByText('TOP')).toBeInTheDocument();
    });

    it('deduplicates courses with the same title', () => {
      // Two entries with same title — only one should appear
      const courses = [
        makeCourse('c1', 'Calculus I', 3, 'C', 2.0),
        makeCourse('c2', 'Calculus I', 3, 'B', 3.0),
      ];

      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      // Should only have 1 candidate (deduplicated by title)
      const allDeltaValues = screen.getAllByText(/^\+\d+\.\d{3}$/);
      expect(allDeltaValues).toHaveLength(1);
    });

    it('limits candidates to 8 maximum', () => {
      const courses = Array.from({ length: 12 }, (_, i) =>
        makeCourse(`c${i}`, `Course ${i}`, 3, 'C', 2.0)
      );

      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      const impacts = screen.getAllByText(/^\+\d+\.\d{3}$/);
      expect(impacts.length).toBeLessThanOrEqual(8);
    });
  });

  describe('retaken badge', () => {
    it('shows "retaken" badge for courses that have been retaken', () => {
      const courses = [
        makeCourse('c1', 'Calculus I', 3, 'C', 2.0, true),
      ];

      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      expect(screen.getByText('retaken')).toBeInTheDocument();
    });

    it('does not show "retaken" badge for courses that have not been retaken', () => {
      const courses = [makeCourse('c1', 'Calculus I', 3, 'C', 2.0, false)];

      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      expect(screen.queryByText('retaken')).not.toBeInTheDocument();
    });
  });

  describe('GPA calculation accuracy', () => {
    it('correctly calculates projected GPA after hypothetical retake', () => {
      // 2 courses: 3cr C(2.0), 3cr A(4.0) → current GPA = (6+12)/6 = 3.000
      // If 3cr C retaken as A: (12+12)/6 = 4.000 → delta = +1.000
      const courses = [
        makeCourse('c1', 'Calculus I', 3, 'C', 2.0),
        makeCourse('c2', 'English', 3, 'A', 4.0),
      ];

      render(<RetakeAnalyzer courses={courses} />);
      fireEvent.click(screen.getByRole('button', { name: /retake impact analyzer/i }));

      expect(screen.getByText('+1.000')).toBeInTheDocument();
    });
  });
});
