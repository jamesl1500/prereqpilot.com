'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

interface ScenarioCourse {
  id: string;
  scenario_id: string;
  taken_course_id: string | null;
  simulated_grade: string | null;
  simulated_grade_value: number | null;
  simulated_credits: number | null;
  simulated_course_title: string | null;
}

interface AddHypotheticalCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
  onSuccess: () => void;
  editingCourse?: ScenarioCourse | null;
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

export default function AddHypotheticalCourseModal({
  isOpen,
  onClose,
  scenarioId,
  onSuccess,
  editingCourse,
}: AddHypotheticalCourseModalProps) {
  const { showToast } = useToast();
  const [courseTitle, setCourseTitle] = useState(editingCourse?.simulated_course_title || '');
  const [credits, setCredits] = useState(editingCourse?.simulated_credits?.toString() || '3');
  const [grade, setGrade] = useState(editingCourse?.simulated_grade || 'A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update form when editingCourse changes
  useEffect(() => {
    if (editingCourse) {
      setCourseTitle(editingCourse.simulated_course_title || '');
      setCredits(editingCourse.simulated_credits?.toString() || '3');
      setGrade(editingCourse.simulated_grade || 'A');
    } else {
      setCourseTitle('');
      setCredits('3');
      setGrade('A');
    }
    setError('');
  }, [editingCourse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!courseTitle.trim()) {
      setError('Course title is required');
      setIsSubmitting(false);
      return;
    }

    const creditsNum = parseFloat(credits);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      setError('Credits must be a positive number');
      setIsSubmitting(false);
      return;
    }

    try {
      const gradeData = GRADE_OPTIONS.find(g => g.value === grade);
      
      if (editingCourse) {
        await fetch(`/api/scenarios/${scenarioId}/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            simulatedCourseTitle: courseTitle.trim(),
            simulatedCredits: creditsNum,
            simulatedGrade: grade,
            simulatedGradeValue: gradeData?.points || 0,
          }),
        });
        showToast('Hypothetical course updated successfully', 'success');
      } else {
        await fetch(`/api/scenarios/${scenarioId}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            takenCourseId: null,
            simulatedCourseTitle: courseTitle.trim(),
            simulatedCredits: creditsNum,
            simulatedGrade: grade,
            simulatedGradeValue: gradeData?.points || 0,
          }),
        });
        showToast('Hypothetical course added successfully', 'success');
      }

      onSuccess();
      
      // Reset form
      setCourseTitle('');
      setCredits('3');
      setGrade('A');
      onClose();
    } catch (err) {
      console.error('Error saving hypothetical course:', err);
      setError(`Failed to ${editingCourse ? 'update' : 'add'} hypothetical course. Please try again.`);
      showToast(`Failed to ${editingCourse ? 'update' : 'add'} hypothetical course`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCourseTitle('');
      setCredits('3');
      setGrade('A');
      setError('');
      onClose();
    }
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hypothetical-course-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="hypothetical-course-modal-title">
            {editingCourse ? 'Edit Hypothetical Course' : 'Add Hypothetical Course'}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <p className={styles.helperText} style={{ marginBottom: '1rem' }}>
            Add a "what-if" course to see how it would impact your GPA and program completion.
          </p>

          <div className={styles.formGroup}>
            <label htmlFor="courseTitle" className={styles.label}>
              Course Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="courseTitle"
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className={styles.input}
              placeholder="e.g., Advanced Calculus"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="credits" className={styles.label}>
                Credits <span aria-hidden="true">*</span>
              </label>
              <input
                id="credits"
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className={styles.input}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="grade" className={styles.label}>
                Expected Grade <span aria-hidden="true">*</span>
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={styles.input}
                required
                disabled={isSubmitting}
              >
                {GRADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.value} ({option.points.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (editingCourse ? 'Updating...' : 'Adding...') : (editingCourse ? 'Update Course' : 'Add Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
