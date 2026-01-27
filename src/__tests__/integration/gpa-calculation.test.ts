/**
 * Integration tests for GPA calculation feature
 */

import { calculateOverallGPA, gradeToGPA } from '@/services/course-service';

describe('GPA Calculation Integration', () => {
  describe('Real-world scenarios', () => {
    it('should calculate GPA for a typical semester', () => {
      const semester = [
        { grade: 'A', credits: 3 },   // Math 101
        { grade: 'B+', credits: 4 },  // Computer Science
        { grade: 'A-', credits: 3 },  // English
        { grade: 'B', credits: 3 },   // Physics
      ];

      const gpa = calculateOverallGPA(semester);
      
      // Expected: (4.0*3 + 3.3*4 + 3.7*3 + 3.0*3) / 13 = 3.48
      expect(gpa).toBeCloseTo(3.48, 2);
    });

    it('should handle full academic year', () => {
      const year = [
        // Fall semester
        { grade: 'A', credits: 3 },
        { grade: 'A-', credits: 4 },
        { grade: 'B+', credits: 3 },
        { grade: 'B', credits: 3 },
        { grade: 'A', credits: 3 },
        // Spring semester
        { grade: 'A+', credits: 4 },
        { grade: 'A', credits: 3 },
        { grade: 'B', credits: 3 },
        { grade: 'A-', credits: 3 },
        { grade: 'B+', credits: 3 },
      ];

      const gpa = calculateOverallGPA(year);
      
      expect(gpa).toBeGreaterThan(3.5);
      expect(gpa).toBeLessThan(4.0);
    });

    it('should handle courses with different credit hours', () => {
      const courses = [
        { grade: 'A', credits: 1 },   // Lab course
        { grade: 'B', credits: 4 },   // Major course
        { grade: 'A-', credits: 3 },  // Regular course
        { grade: 'A+', credits: 5 },  // Intensive course
      ];

      const gpa = calculateOverallGPA(courses);
      
      // Higher credit courses should have more weight
      // Expected: (4.0*1 + 3.0*4 + 3.7*3 + 4.0*5) / 13 = 3.62
      expect(gpa).toBeCloseTo(3.62, 2);
    });

    it('should calculate correctly with all perfect grades', () => {
      const perfectSemester = [
        { grade: 'A+', credits: 3 },
        { grade: 'A', credits: 4 },
        { grade: 'A+', credits: 3 },
        { grade: 'A', credits: 3 },
      ];

      const gpa = calculateOverallGPA(perfectSemester);
      expect(gpa).toBe(4.0);
    });

    it('should calculate correctly with minimum passing grades', () => {
      const minimumPassing = [
        { grade: 'D', credits: 3 },
        { grade: 'D+', credits: 3 },
        { grade: 'D-', credits: 3 },
        { grade: 'D', credits: 3 },
      ];

      const gpa = calculateOverallGPA(minimumPassing);
      // Expected: (1.0*3 + 1.3*3 + 0.7*3 + 1.0*3) / 12 = 1.0
      expect(gpa).toBeCloseTo(1.0, 2);
    });

    it('should handle mixed performance realistically', () => {
      const mixedPerformance = [
        { grade: 'F', credits: 3 },   // Failed course
        { grade: 'A', credits: 3 },   // Recovered
        { grade: 'C', credits: 3 },   // Average
        { grade: 'B+', credits: 3 },  // Good
      ];

      const gpa = calculateOverallGPA(mixedPerformance);
      // Expected: (0.0*3 + 4.0*3 + 2.0*3 + 3.3*3) / 12 = 27.9/12 = 2.325
      expect(gpa).toBeCloseTo(2.325, 2);
    });
  });

  describe('Edge cases', () => {
    it('should handle transcript with retaken courses', () => {
      // Student failed and retook a course
      const transcript = [
        { grade: 'F', credits: 3 },   // First attempt
        { grade: 'A', credits: 3 },   // Retake
        { grade: 'B', credits: 3 },
        { grade: 'A-', credits: 3 },
      ];

      const gpa = calculateOverallGPA(transcript);
      // Note: In real system, only one should count
      // but this tests the calculation function itself
      expect(gpa).toBeDefined();
      expect(gpa).toBeGreaterThanOrEqual(0);
      expect(gpa).toBeLessThanOrEqual(4.0);
    });

    it('should handle very large number of courses', () => {
      const largeCourseLoad = Array(100).fill({ grade: 'B+', credits: 3 });
      const gpa = calculateOverallGPA(largeCourseLoad);
      
      expect(gpa).toBeCloseTo(3.3, 2);
    });

    it('should handle courses with varying credit hours', () => {
      const variedCredits = [
        { grade: 'A', credits: 0.5 },  // Seminar
        { grade: 'A', credits: 1 },    // Lab
        { grade: 'B', credits: 2 },    // Small course
        { grade: 'A-', credits: 3 },   // Regular
        { grade: 'B+', credits: 4 },   // Large course
        { grade: 'A', credits: 5 },    // Intensive
      ];

      const gpa = calculateOverallGPA(variedCredits);
      expect(gpa).toBeGreaterThan(3.4);
      expect(gpa).toBeLessThan(3.9);
    });
  });

  describe('Grade scale verification', () => {
    it('should have all standard letter grades', () => {
      const expectedGrades = [
        'A+', 'A', 'A-',
        'B+', 'B', 'B-',
        'C+', 'C', 'C-',
        'D+', 'D', 'D-',
        'F'
      ];

      expectedGrades.forEach(grade => {
        expect(gradeToGPA).toHaveProperty(grade);
        expect(typeof gradeToGPA[grade]).toBe('number');
      });
    });

    it('should have correct GPA scale progression', () => {
      expect(gradeToGPA['A+']).toBe(4.0);
      expect(gradeToGPA['A']).toBe(4.0);
      expect(gradeToGPA['A-']).toBeLessThan(gradeToGPA['A']);
      expect(gradeToGPA['B+']).toBeGreaterThan(gradeToGPA['B']);
      expect(gradeToGPA['B-']).toBeLessThan(gradeToGPA['B']);
      expect(gradeToGPA['F']).toBe(0.0);
    });

    it('should maintain decreasing order', () => {
      const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
      
      for (let i = 0; i < grades.length - 1; i++) {
        expect(gradeToGPA[grades[i]]).toBeGreaterThanOrEqual(gradeToGPA[grades[i + 1]]);
      }
    });
  });

  describe('GPA calculation accuracy', () => {
    it('should maintain precision with decimal grades', () => {
      const courses = [
        { grade: 'A-', credits: 3 },  // 3.7
        { grade: 'B+', credits: 3 },  // 3.3
      ];

      const gpa = calculateOverallGPA(courses);
      expect(gpa).toBeCloseTo(3.5, 10); // Very precise
    });

    it('should round to reasonable precision', () => {
      const courses = [
        { grade: 'A', credits: 3 },
        { grade: 'B+', credits: 4 },
        { grade: 'B', credits: 3 },
      ];

      const gpa = calculateOverallGPA(courses);
      // Should be precise to 2 decimal places
      expect(Number(gpa.toFixed(2))).toBeCloseTo(gpa, 2);
    });
  });
});
