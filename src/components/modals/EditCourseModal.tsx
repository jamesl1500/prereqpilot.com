'use client';

import { useState, useEffect } from 'react';
import { PlannedCourse } from '@/types/plan';
import { updatePlannedCourse } from '@/services/plan-service';
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
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Edit Course</h3>

        <div className={styles.formGroup}>
          <label>Course Title *</label>
          <input
            type="text"
            className={styles.input}
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g., Introduction to Computer Science"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Course Code</label>
            <input
              type="text"
              className={styles.input}
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., CS 101"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Credits *</label>
            <input
              type="number"
              step="0.5"
              className={styles.input}
              value={courseCredits}
              onChange={(e) => setCourseCredits(parseFloat(e.target.value))}
              min={0}
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleSave}
            disabled={isSaving || !courseTitle.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}