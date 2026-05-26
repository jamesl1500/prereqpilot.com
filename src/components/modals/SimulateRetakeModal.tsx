'use client';

import { useState } from 'react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

interface SimulateRetakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
  courses: Array<{
    id: string;
    course_title: string;
    credits: number;
    grade: string | null;
  }>;
  onSuccess: () => void;
}

const GRADE_OPTIONS = [
  { value: 'A', points: 4.0 },
  { value: 'A-', points: 3.7 },
  { value: 'B+', points: 3.3 },
  { value: 'B', points: 3.0 },
  { value: 'B-', points: 2.7 },
  { value: 'C+', points: 2.3 },
  { value: 'C', points: 2.0 },
  { value: 'C-', points: 1.7 },
  { value: 'D+', points: 1.3 },
  { value: 'D', points: 1.0 },
  { value: 'F', points: 0.0 },
];

export default function SimulateRetakeModal({
  isOpen,
  onClose,
  scenarioId,
  courses,
  onSuccess,
}: SimulateRetakeModalProps) {
  const { showToast } = useToast();
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [markAsRepeats, setMarkAsRepeats] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGradeChange = (courseId: string, grade: string) => {
    setGrades(prev => ({ ...prev, [courseId]: grade }));
  };

  const handleRepeatToggle = (courseId: string) => {
    setMarkAsRepeats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Update each course simulation
      await Promise.all(
        courses.map(course => {
          const simulatedGrade = grades[course.id];
          if (!simulatedGrade) return Promise.resolve();

          const gradeData = GRADE_OPTIONS.find(g => g.value === simulatedGrade);
          
          return fetch(`/api/scenarios/${scenarioId}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              takenCourseId: course.id,
              simulatedGrade,
              simulatedGradeValue: gradeData?.points || 0,
              isRepeat: markAsRepeats.has(course.id),
            }),
          });
        })
      );

      onSuccess();
      showToast('Retake simulation saved successfully', 'success');
      onClose();
    } catch (err) {
      console.error('Error simulating retakes:', err);
      setError('Failed to simulate retakes. Please try again.');
      showToast('Failed to simulate retakes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulate-retake-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="simulate-retake-modal-title">
            Simulate Retakes
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className={styles.form}
          aria-label="Simulate retake grades form"
        >
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          <p className={styles.subtitle}>
            Select new grades for the courses you want to simulate retaking
          </p>
          <div className={styles.coursesList}>
            {courses.map(course => (
              <div key={course.id} className={styles.courseItem}>
                <div className={styles.courseHeader}>
                  <div>
                    <div className={styles.courseName}>{course.course_title}</div>
                    <div className={styles.courseInfo}>
                      Current grade: {course.grade || 'N/A'} • {course.credits} credits
                    </div>
                  </div>
                </div>

                <div className={styles.gradeSelection}>
                  <label htmlFor={`grade-${course.id}`} className={styles.label}>
                    New Grade
                  </label>
                  <select
                    id={`grade-${course.id}`}
                    className={styles.select}
                    value={grades[course.id] || ''}
                    onChange={(e) => handleGradeChange(course.id, e.target.value)}
                    required
                    aria-required="true"
                    aria-label={`New grade for ${course.course_title}`}
                  >
                    <option value="">Select grade...</option>
                    {GRADE_OPTIONS.map(grade => (
                      <option key={grade.value} value={grade.value}>
                        {grade.value} ({grade.points.toFixed(1)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={markAsRepeats.has(course.id)}
                      onChange={() => handleRepeatToggle(course.id)}
                      aria-label={`Mark ${course.course_title} as repeat`}
                    />
                    <span>Mark original as repeat (will exclude from GPA)</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || Object.keys(grades).length === 0}
            >
              {isSubmitting ? 'Simulating...' : 'Apply Simulations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
