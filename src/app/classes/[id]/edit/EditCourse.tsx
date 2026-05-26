'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import type { Course } from '@/types/course';
import type { User } from '@supabase/supabase-js';
import styles from '@/styles/modules/pages/edit-course.module.scss';
import { ArrowLeft, BookOpen, Check } from 'lucide-react';

const courseSchema = z.object({
  course_title: z.string().min(1, 'Course title is required'),
  credits: z.number().min(0.5, 'Credits must be at least 0.5'),
  grade: z.string().optional(),
  institution_id: z.string().optional(),
  notes: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface EditCourseProps {
  user: User;
  course: Course;
  institutions: { id: string; name: string }[];
}

export default function EditCourse({ user, course, institutions }: EditCourseProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_title: course.course_title,
      credits: course.credits,
      grade: course.grade || '',
      institution_id: course.institution_id || '',
      notes: course.notes || '',
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'An error occurred while updating the course');
      }
      setSuccessMessage('Course updated successfully!');
      setTimeout(() => {
        router.push(`/classes/${course.id}`);
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/classes/${course.id}`);
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        {/* Back Button */}
        <button onClick={() => router.push('/classes')} className={styles.backButton}>
          <ArrowLeft size={20} strokeWidth={2} />
          Back to Classes
        </button>

        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <BookOpen size={48} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={styles.title}>Edit Course</h1>
              <p className={styles.subtitle}>Update the details of {course.course_title}</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {error && (
              <div className={styles.errorBox}>
                <p>{error}</p>
              </div>
            )}
            {successMessage && (
              <div className={styles.successBox}>
                <Check size={20} strokeWidth={2} />
                <p>{successMessage}</p>
              </div>
            )}
            {/* Course Title */}
            <div className={styles.formGroup}>
              <label htmlFor="course_title" className={styles.label}>Course Title *</label>
              <div className={styles.inputWithIcon}>
                <BookOpen size={18} strokeWidth={2} />
                <input
                  id="course_title"
                  type="text"
                  {...register('course_title')}
                  className={styles.input}
                  placeholder="e.g., Calculus I"
                  disabled={isSubmitting}
                />
              </div>
              {errors.course_title && (
                <span className={styles.fieldError}>{errors.course_title.message}</span>
              )}
              <span className={styles.fieldHint}>Enter the full course name</span>
            </div>
            {/* Credits */}
            <div className={styles.formGroup}>
              <label htmlFor="credits" className={styles.label}>Credits *</label>
              <input
                id="credits"
                type="number"
                step="0.1"
                min="0.5"
                {...register('credits', { valueAsNumber: true })}
                className={styles.input}
                placeholder="e.g., 3.0"
                disabled={isSubmitting}
              />
              {errors.credits && (
                <span className={styles.fieldError}>{errors.credits.message}</span>
              )}
              <span className={styles.fieldHint}>Number of credit hours</span>
            </div>
            {/* Grade */}
            <div className={styles.formGroup}>
              <label htmlFor="grade" className={styles.label}>Grade</label>
              <input
                id="grade"
                type="text"
                {...register('grade')}
                className={styles.input}
                placeholder="e.g., A, B+, IP"
                disabled={isSubmitting}
              />
              <span className={styles.fieldHint}>Leave blank if in progress</span>
            </div>
            {/* Institution */}
            <div className={styles.formGroup}>
              <label htmlFor="institution_id" className={styles.label}>Institution</label>
              <select
                id="institution_id"
                {...register('institution_id')}
                className={styles.input}
                disabled={isSubmitting}
              >
                <option value="">Select an institution</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Notes */}
            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>Notes</label>
              <textarea
                id="notes"
                {...register('notes')}
                className={styles.input}
                placeholder="Any additional notes about this course"
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleCancel}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
