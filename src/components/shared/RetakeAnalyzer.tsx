'use client';

import { useMemo, useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '@/styles/modules/pages/classes.module.scss';

interface Course {
  id: string;
  course_title: string;
  credits: number;
  grade: string | null;
  grade_value: number | null;
  is_retaken?: boolean;
}

interface RetakeAnalyzerProps {
  courses: Course[];
}

function calculateGPA(courses: { credits: number; grade_value: number | null }[]): number | null {
  const valid = courses.filter((c) => c.grade_value !== null && Number(c.credits) > 0);
  if (valid.length === 0) return null;
  const totalPoints = valid.reduce((s, c) => s + Number(c.grade_value) * Number(c.credits), 0);
  const totalCredits = valid.reduce((s, c) => s + Number(c.credits), 0);
  return totalCredits > 0 ? totalPoints / totalCredits : null;
}

interface RetakeCandidate {
  id: string;
  course_title: string;
  credits: number;
  currentGrade: string;
  currentGradeValue: number;
  projectedGPA: number;
  delta: number;
  is_retaken: boolean;
}

export default function RetakeAnalyzer({ courses }: RetakeAnalyzerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { currentGPA, candidates } = useMemo(() => {
    const gradedCourses = courses.filter((c) => c.grade_value !== null && Number(c.credits) > 0);
    const gpa = calculateGPA(gradedCourses);

    if (gpa === null || gradedCourses.length === 0) {
      return { currentGPA: null, candidates: [] };
    }

    const seen = new Set<string>();
    const results: RetakeCandidate[] = [];

    for (const course of gradedCourses) {
      const gv = Number(course.grade_value);
      if (gv >= 4.0) continue; // Can't improve A+/A

      // Avoid duplicating same course title (only show best improvement opportunity)
      const key = course.course_title.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);

      // Project GPA if this course became an A (4.0)
      const withRetake = gradedCourses.map((c) =>
        c.id === course.id ? { ...c, grade_value: 4.0 } : c
      );
      const projected = calculateGPA(withRetake);
      if (projected === null) continue;

      results.push({
        id: course.id,
        course_title: course.course_title,
        credits: Number(course.credits),
        currentGrade: course.grade ?? '?',
        currentGradeValue: gv,
        projectedGPA: projected,
        delta: projected - gpa,
        is_retaken: course.is_retaken ?? false,
      });
    }

    // Sort by delta descending (biggest impact first)
    results.sort((a, b) => b.delta - a.delta);

    return { currentGPA: gpa, candidates: results.slice(0, 8) };
  }, [courses]);

  if (currentGPA === null || candidates.length === 0) return null;

  return (
    <div className={styles.retakeSection}>
      <div
        className={styles.retakeHeader}
        onClick={() => setIsExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
      >
        <div className={styles.retakeTitleGroup}>
          <RefreshCw size={18} strokeWidth={2.5} />
          <h3 className={styles.retakeTitle}>Retake Impact Analyzer</h3>
          <span className={styles.retakeBadge}>{candidates.length} candidates</span>
        </div>
        <span className={styles.retakeToggle}>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </div>

      {isExpanded && (
        <div className={styles.retakeBody}>
          <p className={styles.retakeHint}>
            Courses ranked by how much your GPA would improve if retaken with an A.
            Current GPA: <strong>{currentGPA.toFixed(3)}</strong>
          </p>

          <div className={styles.retakeTable}>
            <div className={styles.retakeTableHead}>
              <span>Course</span>
              <span>Credits</span>
              <span>Current</span>
              <span>Projected GPA</span>
              <span>Impact</span>
            </div>

            {candidates.map((c, i) => (
              <div key={c.id} className={styles.retakeTableRow}>
                <span className={styles.retakeCourseTitle}>
                  {i === 0 && <span className={styles.retakeTopBadge}>TOP</span>}
                  {c.course_title}
                  {c.is_retaken && <span className={styles.retakeAlreadyBadge}>retaken</span>}
                </span>
                <span className={styles.retakeCell}>{c.credits.toFixed(1)}</span>
                <span className={styles.retakeCell}>{c.currentGrade}</span>
                <span className={styles.retakeCell}>{c.projectedGPA.toFixed(3)}</span>
                <span className={styles.retakeImpact}>+{c.delta.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
