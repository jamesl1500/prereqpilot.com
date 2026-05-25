import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgramMatchWidget from '@/components/shared/ProgramMatchWidget';

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// lucide-react icons are globally mocked via moduleNameMapper

const makeProgram = (overrides: Partial<Parameters<typeof ProgramMatchWidget>[0]['programs'][0]> = {}) => ({
  id: 'prog-1',
  name: 'Computer Science',
  min_overall_gpa: null,
  min_prereq_gpa: null,
  institution: { name: 'State University', short_code: 'SU' },
  program_required_courses: [],
  ...overrides,
});

const makeRequiredCourse = (id: string, title: string, required = true) => ({
  id,
  course_title: title,
  is_required: required,
  min_grade: null,
  credits: 3,
});

describe('ProgramMatchWidget', () => {
  describe('empty state', () => {
    it('renders empty state when no programs are provided', () => {
      render(
        <ProgramMatchWidget programs={[]} takenCourses={[]} overallGPA={null} />
      );

      expect(screen.getByText(/add programs to see your match score/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse programs/i })).toHaveAttribute('href', '/programs');
    });

    it('shows Program Match heading in empty state', () => {
      render(
        <ProgramMatchWidget programs={[]} takenCourses={[]} overallGPA={null} />
      );
      expect(screen.getByText('Program Match')).toBeInTheDocument();
    });
  });

  describe('with programs', () => {
    it('renders a card for each program', () => {
      const programs = [
        makeProgram({ id: 'p1', name: 'Computer Science' }),
        makeProgram({ id: 'p2', name: 'Mathematics' }),
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={[]} overallGPA={null} />
      );

      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });

    it('shows institution name on each card', () => {
      render(
        <ProgramMatchWidget
          programs={[makeProgram({ institution: { name: 'MIT', short_code: null } })]}
          takenCourses={[]}
          overallGPA={null}
        />
      );

      expect(screen.getByText('MIT')).toBeInTheDocument();
    });

    it('shows View All link pointing to /programs', () => {
      render(
        <ProgramMatchWidget
          programs={[makeProgram()]}
          takenCourses={[]}
          overallGPA={null}
        />
      );

      expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/programs');
    });

    it('shows View Details link for each program card', () => {
      render(
        <ProgramMatchWidget
          programs={[makeProgram({ id: 'prog-abc' })]}
          takenCourses={[]}
          overallGPA={null}
        />
      );

      const detailLink = screen.getByRole('link', { name: /view details/i });
      expect(detailLink).toHaveAttribute('href', '/programs/prog-abc');
    });
  });

  describe('score calculation', () => {
    it('shows 100% when all required courses are satisfied', () => {
      const programs = [
        makeProgram({
          program_required_courses: [
            makeRequiredCourse('rc-1', 'Calculus I'),
            makeRequiredCourse('rc-2', 'Introduction to Programming'),
          ],
        }),
      ];

      const takenCourses = [
        { course_title: 'Calculus I', grade_value: 3.7 },
        { course_title: 'Introduction to Programming', grade_value: 4.0 },
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={takenCourses} overallGPA={3.8} />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('shows 0% when no required courses are satisfied', () => {
      const programs = [
        makeProgram({
          program_required_courses: [
            makeRequiredCourse('rc-1', 'Calculus I'),
            makeRequiredCourse('rc-2', 'Algorithms'),
          ],
        }),
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={[]} overallGPA={null} />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('shows partial score when some required courses are satisfied', () => {
      const programs = [
        makeProgram({
          min_overall_gpa: null,
          program_required_courses: [
            makeRequiredCourse('rc-1', 'Calculus I'),
            makeRequiredCourse('rc-2', 'Algorithms'),
            makeRequiredCourse('rc-3', 'Data Structures'),
            makeRequiredCourse('rc-4', 'Linear Algebra'),
          ],
        }),
      ];

      // 2 of 4 required courses satisfied → course score 50%, no GPA requirement → overall 50%
      const takenCourses = [
        { course_title: 'Calculus I', grade_value: 4.0 },
        { course_title: 'Algorithms', grade_value: 3.7 },
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={takenCourses} overallGPA={null} />
      );

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('deducts from score when GPA is below minimum', () => {
      const programs = [
        makeProgram({
          min_overall_gpa: 3.0,
          program_required_courses: [
            makeRequiredCourse('rc-1', 'Calculus I'),
          ],
        }),
      ];

      const takenCourses = [{ course_title: 'Calculus I', grade_value: 4.0 }];

      render(
        // GPA 2.5 < 3.0 required → GPA portion fails (25 pts lost) → overall = 75%
        <ProgramMatchWidget programs={programs} takenCourses={takenCourses} overallGPA={2.5} />
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('shows 100% when all courses satisfied and GPA meets requirement', () => {
      const programs = [
        makeProgram({
          min_overall_gpa: 3.0,
          program_required_courses: [makeRequiredCourse('rc-1', 'Calculus I')],
        }),
      ];

      render(
        <ProgramMatchWidget
          programs={programs}
          takenCourses={[{ course_title: 'Calculus I', grade_value: 4.0 }]}
          overallGPA={3.5}
        />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('shows 100% when there are no required courses listed', () => {
      const programs = [makeProgram({ program_required_courses: [] })];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={[]} overallGPA={null} />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('course breakdown display', () => {
    it('shows matched course count', () => {
      const programs = [
        makeProgram({
          program_required_courses: [
            makeRequiredCourse('rc-1', 'Calculus I'),
            makeRequiredCourse('rc-2', 'Algorithms'),
          ],
        }),
      ];

      render(
        <ProgramMatchWidget
          programs={programs}
          takenCourses={[{ course_title: 'Calculus I', grade_value: 4.0 }]}
          overallGPA={null}
        />
      );

      expect(screen.getByText(/1 \/ 2 required courses/)).toBeInTheDocument();
    });

    it('shows "No required courses listed" when program has no required courses', () => {
      render(
        <ProgramMatchWidget
          programs={[makeProgram({ program_required_courses: [] })]}
          takenCourses={[]}
          overallGPA={null}
        />
      );

      expect(screen.getByText(/no required courses listed/i)).toBeInTheDocument();
    });

    it('shows missing courses badges', () => {
      const programs = [
        makeProgram({
          program_required_courses: [
            makeRequiredCourse('rc-1', 'Calculus I'),
            makeRequiredCourse('rc-2', 'Algorithms'),
          ],
        }),
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={[]} overallGPA={null} />
      );

      expect(screen.getByText('Calculus I')).toBeInTheDocument();
      expect(screen.getByText('Algorithms')).toBeInTheDocument();
    });

    it('shows "+N more" when more than 3 courses are missing', () => {
      const programs = [
        makeProgram({
          program_required_courses: [
            makeRequiredCourse('rc-1', 'Course A'),
            makeRequiredCourse('rc-2', 'Course B'),
            makeRequiredCourse('rc-3', 'Course C'),
            makeRequiredCourse('rc-4', 'Course D'),
            makeRequiredCourse('rc-5', 'Course E'),
          ],
        }),
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={[]} overallGPA={null} />
      );

      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('shows GPA requirement when min_overall_gpa is set', () => {
      const programs = [
        makeProgram({ min_overall_gpa: 3.2, program_required_courses: [] }),
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={[]} overallGPA={2.9} />
      );

      expect(screen.getByText(/2\.90.*\/.*3\.20 required/)).toBeInTheDocument();
    });

    it('shows N/A for GPA when overallGPA is null', () => {
      const programs = [
        makeProgram({ min_overall_gpa: 3.0, program_required_courses: [] }),
      ];

      render(
        <ProgramMatchWidget programs={programs} takenCourses={[]} overallGPA={null} />
      );

      expect(screen.getByText(/n\/a.*\/.*3\.00 required/i)).toBeInTheDocument();
    });
  });

  describe('title matching', () => {
    it('matches courses case-insensitively', () => {
      const programs = [
        makeProgram({
          program_required_courses: [makeRequiredCourse('rc-1', 'calculus i')],
        }),
      ];

      render(
        <ProgramMatchWidget
          programs={programs}
          takenCourses={[{ course_title: 'CALCULUS I', grade_value: 4.0 }]}
          overallGPA={null}
        />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('matches courses with punctuation differences', () => {
      const programs = [
        makeProgram({
          program_required_courses: [makeRequiredCourse('rc-1', 'Intro to Programming!')],
        }),
      ];

      render(
        <ProgramMatchWidget
          programs={programs}
          takenCourses={[{ course_title: 'Intro to Programming', grade_value: 3.7 }]}
          overallGPA={null}
        />
      );

      // Should match via inclusion
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});
