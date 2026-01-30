'use client';

import { useState, useEffect } from 'react';
import { PlannedCourse } from '@/types/plan';
import { updatePlannedCourse } from '@/services/plan-service';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/modals/EditCourseModal.module.scss';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: PlannedCourse | null;
  onUpdate: () => void;
}

export default function EditCourseModal({
  isOpen,
  onClose,
  course,
  onUpdate,
}: EditCourseModalProps) {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCredits, setCourseCredits] = useState<number>(3);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (course) {
      setCourseTitle(course.course_title);
      setCourseCode(course.course_code || '');
      setCourseCredits(course.credits);
    }
  }, [course]);

  const handleSave = async () => {
    if (!course || !courseTitle.trim()) return;

    setIsSaving(true);
    try {
      await updatePlannedCourse(course.id, {
        course_title: courseTitle,
        course_code: courseCode || undefined,
        credits: courseCredits,
      });
      showToast('Course updated successfully', 'success');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update course:', error);
      showToast('Failed to update course', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div 
      className={styles.modalOverlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-course-modal-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle} id="edit-course-modal-title">
          Edit Course
        </h3>

        <div className={styles.formGroup}>
          <label htmlFor="courseTitle">
            Course Title <span aria-hidden="true">*</span>
          </label>
          <input
            id="courseTitle"
            type="text"
            className={styles.input}
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g., Introduction to Computer Science"
            aria-required="true"
            aria-invalid={!courseTitle.trim() ? 'true' : 'false'}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="courseCode">Course Code</label>
            <input
              id="courseCode"
              type="text"
              className={styles.input}
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., CS 101"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="courseCredits">
              Credits <span aria-hidden="true">*</span>
            </label>
            <input
              id="courseCredits"
              type="number"
              step="0.5"
              className={styles.input}
              value={courseCredits}
              onChange={(e) => setCourseCredits(parseFloat(e.target.value))}
              min={0}
              aria-required="true"
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={isSaving}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleSave}
            disabled={isSaving || !courseTitle.trim()}
            aria-busy={isSaving ? 'true' : 'false'}
            type="button"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}