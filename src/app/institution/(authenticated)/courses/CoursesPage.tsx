'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types/institution';
import { BookOpen, Plus, Edit2, Trash2, GraduationCap, Search } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/institution-courses.module.scss';

const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  title: z.string().min(1, 'Course title is required'),
  credits: z.number().min(0).max(10),
  description: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id: string;
  institution_id: string;
  code: string;
  title: string;
  credits: number;
  description: string | null;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

interface CoursesPageProps {
  user: User;
  institution: Institution;
  courses: Course[];
}

export default function CoursesPage({ institution, courses: initialCourses }: CoursesPageProps) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      title: '',
      credits: 3,
      description: '',
    },
  });

  const refreshCourses = async () => {
    try {
      const response = await fetch('/api/institution/courses');
      if (response.ok) {
        const json = await response.json();
        setCourses(json.data);
      }
    } catch (err) {
      console.error('Error refreshing courses:', err);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingCourse
        ? `/api/institution/courses/${editingCourse.id}`
        : '/api/institution/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to save course');
      }
      await refreshCourses();
      setShowForm(false);
      setEditingCourse(null);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    reset({
      code: course.code,
      title: course.title,
      credits: course.credits,
      description: course.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will not affect existing program requirements that reference it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/institution/courses/${courseId}`, { method: 'DELETE' });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to delete course');
      }
      showToast('Course deleted successfully', 'success');
      await refreshCourses();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete course', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
    setError(null);
    reset();
  };

  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <BookOpen size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Course Catalog</h1>
            <p className={styles.subtitle}>{institution.name}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className={styles.primaryButton}
        >
          <Plus size={20} />
          <span>Add Course</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {showForm && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="code" className={styles.label}>Course Code *</label>
                <input
                  id="code"
                  type="text"
                  className={styles.input}
                  {...register('code')}
                  placeholder="e.g., CS101"
                />
                {errors.code && (
                  <span className={styles.fieldError}>{errors.code.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="credits" className={styles.label}>Credits *</label>
                <input
                  id="credits"
                  type="number"
                  step="0.5"
                  className={styles.input}
                  {...register('credits', { valueAsNumber: true })}
                />
                {errors.credits && (
                  <span className={styles.fieldError}>{errors.credits.message}</span>
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="title" className={styles.label}>Course Title *</label>
                <input
                  id="title"
                  type="text"
                  className={styles.input}
                  {...register('title')}
                  placeholder="e.g., Introduction to Computer Science"
                />
                {errors.title && (
                  <span className={styles.fieldError}>{errors.title.message}</span>
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea
                  id="description"
                  className={styles.textarea}
                  {...register('description')}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.formActions}>
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
                {isSubmitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Add Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.searchBar}>
        <Search size={20} />
        <input
          type="text"
          placeholder="Search courses by code or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className={styles.empty}>
          <GraduationCap size={48} strokeWidth={1.5} />
          <h3>No courses yet</h3>
          <p>Add courses to your institution's catalog to use them in program requirements.</p>
          <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
            <Plus size={20} />
            <span>Add First Course</span>
          </button>
        </div>
      ) : (
        <div className={styles.coursesGrid}>
          {filteredCourses.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              <div className={styles.courseHeader}>
                <div>
                  <h3 className={styles.courseCode}>{course.code}</h3>
                  <p className={styles.courseTitle}>{course.title}</p>
                </div>
                <div className={styles.courseCredits}>{course.credits} CR</div>
              </div>
              
              {course.description && (
                <p className={styles.courseDescription}>{course.description}</p>
              )}

              <div className={styles.courseActions}>
                <button
                  onClick={() => handleEdit(course)}
                  className={styles.editButton}
                  title="Edit course"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className={styles.deleteButton}
                  title="Delete course"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
