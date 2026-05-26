'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Institution } from '@/types/institution';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/institution-course-form.module.scss';

const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  title: z.string().min(1, 'Course title is required'),
  credits: z.number().min(0, 'Credits must be at least 0').max(12, 'Credits cannot exceed 12'),
  description: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  prerequisites: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CreateCoursePageProps {
  institution: Institution;
}

export default function CreateCoursePage({ institution }: CreateCoursePageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      title: '',
      credits: 3,
      description: '',
      department: '',
      level: '',
      prerequisites: '',
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/institution/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: data.code,
          course_title: data.title,
          code: data.code,
          title: data.title,
          credits: data.credits,
          description: data.description || null,
          department: data.department || null,
          level: data.level || null,
          prerequisites: data.prerequisites || null,
        }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to create course');
      }
      showToast('Course created successfully!', 'success');
      router.push('/institution/courses');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred while creating the course';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button onClick={() => router.push('/institution/courses')} className={styles.backButton}>
        <ArrowLeft size={20} strokeWidth={2} />
        Back to Courses
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <BookOpen size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Add New Course</h1>
            <p className={styles.subtitle}>Add a new course to {institution.name}&apos;s catalog</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && (
            <div className={styles.errorBox}>
              <p>{error}</p>
            </div>
          )}

          {/* Course Code and Credits Row */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="code" className={styles.label}>
                Course Code *
              </label>
              <input
                id="code"
                type="text"
                {...register('code')}
                className={styles.input}
                placeholder="e.g., CS101"
                disabled={isSubmitting}
              />
              {errors.code && (
                <span className={styles.fieldError}>{errors.code.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="credits" className={styles.label}>
                Credits *
              </label>
              <input
                id="credits"
                type="number"
                step="0.5"
                min="0"
                max="12"
                {...register('credits', { valueAsNumber: true })}
                className={styles.input}
                disabled={isSubmitting}
              />
              {errors.credits && (
                <span className={styles.fieldError}>{errors.credits.message}</span>
              )}
            </div>
          </div>

          {/* Course Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Course Title *
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className={styles.input}
              placeholder="e.g., Introduction to Computer Science"
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className={styles.fieldError}>{errors.title.message}</span>
            )}
          </div>

          {/* Department and Level Row */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="department" className={styles.label}>
                Department
              </label>
              <input
                id="department"
                type="text"
                {...register('department')}
                className={styles.input}
                placeholder="e.g., Computer Science"
                disabled={isSubmitting}
              />
              {errors.department && (
                <span className={styles.fieldError}>{errors.department.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="level" className={styles.label}>
                Level
              </label>
              <select
                id="level"
                {...register('level')}
                className={styles.select}
                disabled={isSubmitting}
              >
                <option value="">Select level</option>
                <option value="100">100 - Introductory</option>
                <option value="200">200 - Lower Division</option>
                <option value="300">300 - Upper Division</option>
                <option value="400">400 - Advanced</option>
                <option value="500">500 - Graduate</option>
              </select>
              {errors.level && (
                <span className={styles.fieldError}>{errors.level.message}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              className={styles.textarea}
              placeholder="Course description and learning objectives..."
              disabled={isSubmitting}
              rows={4}
            />
            {errors.description && (
              <span className={styles.fieldError}>{errors.description.message}</span>
            )}
            <span className={styles.fieldHint}>
              Brief overview of what students will learn in this course
            </span>
          </div>

          {/* Prerequisites */}
          <div className={styles.formGroup}>
            <label htmlFor="prerequisites" className={styles.label}>
              Prerequisites
            </label>
            <textarea
              id="prerequisites"
              {...register('prerequisites')}
              className={styles.textarea}
              placeholder="e.g., MATH101, CS100 or instructor approval"
              disabled={isSubmitting}
              rows={2}
            />
            {errors.prerequisites && (
              <span className={styles.fieldError}>{errors.prerequisites.message}</span>
            )}
            <span className={styles.fieldHint}>
              List any courses or requirements students need before taking this course
            </span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => router.push('/institution/courses')}
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
              <Save size={20} strokeWidth={2} />
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
