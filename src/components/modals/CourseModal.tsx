'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { gradeToGPA } from '@/services/course-service';
import type { CourseModalProps } from '@/types/modal';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

const courseSchema = z.object({
  course_title: z.string().min(1, 'Course title is required'),
  credits: z.number().min(0, 'Credits must be positive'),
  grade: z.string().optional(),
  grade_value: z.number().min(0).max(4).optional().nullable(),
  term_id: z.string().min(1, 'Term is required'),
  institution_id: z.string().optional().nullable(),
  notes: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function CourseModal({ isOpen, onClose, course, terms, institutions }: CourseModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      credits: 3,
    },
  });

  const gradeValue = watch('grade');

  // Update grade_value when grade changes
  useEffect(() => {
    if (gradeValue && gradeValue.trim()) {
      const upperGrade = gradeValue.trim().toUpperCase();
      if (gradeToGPA[upperGrade] !== undefined) {
        setValue('grade_value', gradeToGPA[upperGrade]);
      }
    }
  }, [gradeValue, setValue]);

  // Update form when course changes
  useEffect(() => {
    if (course) {
      reset({
        course_title: course.course_title,
        credits: course.credits,
        grade: course.grade || '',
        grade_value: course.grade_value || undefined,
        term_id: course.term_id || '',
        institution_id: course.institution_id || null,
        notes: course.notes || '',
      });
    } else {
      reset({
        course_title: '',
        credits: 3,
        grade: '',
        grade_value: undefined,
        term_id: '',
        institution_id: null,
        notes: '',
      });
    }
  }, [course, reset]);

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const courseData = {
        course_title: data.course_title,
        credits: data.credits,
        grade: data.grade || null,
        grade_value: data.grade_value || null,
        term_id: data.term_id,
        institution_id: data.institution_id || null,
        notes: data.notes || null,
      };

      if (course) {
        // Update existing course
        await axios.put(`/api/courses/${course.id}`, courseData);
      } else {
        // Create new course
        await axios.post('/api/courses', courseData);
      }

      reset();
      router.refresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {course ? 'Edit Course' : 'Add Course'}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="course_title" className={styles.label}>
              Course Title *
            </label>
            <input
              id="course_title"
              type="text"
              {...register('course_title')}
              className={styles.input}
              placeholder="e.g., Introduction to Computer Science"
            />
            {errors.course_title && (
              <span className={styles.fieldError}>{errors.course_title.message}</span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="credits" className={styles.label}>
                Credits *
              </label>
              <input
                id="credits"
                type="number"
                step="0.5"
                {...register('credits', { valueAsNumber: true })}
                className={styles.input}
              />
              {errors.credits && (
                <span className={styles.fieldError}>{errors.credits.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="term_id" className={styles.label}>
                Term *
              </label>
              <select id="term_id" {...register('term_id')} className={styles.select}>
                <option value="">Select a term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
              {errors.term_id && (
                <span className={styles.fieldError}>{errors.term_id.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="institution_id" className={styles.label}>
              Institution
            </label>
            <select 
              id="institution_id" 
              {...register('institution_id')} 
              className={styles.select}
            >
              <option value="">Select an institution (optional)</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name} ({institution.short_code})
                </option>
              ))}
            </select>
            <span className={styles.fieldHint}>
              Associate this course with an institution for your transcript
            </span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="grade" className={styles.label}>
                Grade
              </label>
              <input
                id="grade"
                type="text"
                {...register('grade')}
                className={styles.input}
                placeholder="e.g., A, B+, C-, IP"
              />
              <span className={styles.fieldHint}>
                Enter letter grade (A, A-, B+, etc.) to auto-fill GPA
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="grade_value" className={styles.label}>
                Grade Value (GPA)
              </label>
              <input
                id="grade_value"
                type="number"
                step="0.01"
                {...register('grade_value', { valueAsNumber: true })}
                className={styles.input}
                placeholder="0.00 - 4.00"
              />
              <span className={styles.fieldHint}>
                Auto-filled from grade or enter manually
              </span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>
              Notes
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              className={styles.textarea}
              rows={3}
              placeholder="Additional notes about this course..."
            />
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
              {isSubmitting ? 'Saving...' : course ? 'Update' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
