'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types/institution';
import { ArrowLeft, Save, GraduationCap, Plus, Trash2, Edit2 } from 'lucide-react';
import styles from '@/styles/modules/pages/institution-program-edit.module.scss';

const programSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  requirements_text: z.string().optional(),
  min_prereq_gpa: z.number().min(0).max(4.0).nullable().optional(),
  min_overall_gpa: z.number().min(0).max(4.0).nullable().optional(),
});

const courseSchema = z.object({
  course_title: z.string().min(1, 'Course title is required'),
  course_code: z.string().optional(),
  credits: z.number().min(0).max(10),
  min_grade: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  is_required: z.boolean(),
});

type ProgramFormData = z.infer<typeof programSchema>;
type CourseFormData = z.infer<typeof courseSchema>;

interface Program {
  id: string;
  name: string;
  description?: string | null;
  requirements_text?: string | null;
  institution: string | null;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
}

interface RequiredCourse {
  id: string;
  course_title: string;
  course_code: string | null;
  credits: number;
  min_grade: string | null;
  description: string | null;
  category: string | null;
  is_required: boolean;
  display_order: number;
  course_id?: string | null;
}

interface CatalogCourse {
  id: string;
  institution_id: string;
  code: string;
  title: string;
  credits: number;
  description: string | null;
}

interface EditProgramPageProps {
  user: User;
  institution: Institution;
  program: Program;
  requiredCourses: RequiredCourse[];
  catalogCourses: CatalogCourse[];
}

type TabType = 'basic' | 'courses' | 'gpa' | 'meta';

export default function EditProgramPage({ institution, program, requiredCourses, catalogCourses }: EditProgramPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<RequiredCourse[]>(requiredCourses);
  const [editingCourse, setEditingCourse] = useState<RequiredCourse | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedCatalogCourse, setSelectedCatalogCourse] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: program.name,
      description: program.description || '',
      requirements_text: program.requirements_text || '',
      min_prereq_gpa: program.min_prereq_gpa,
      min_overall_gpa: program.min_overall_gpa,
    },
  });

  const {
    register: registerCourse,
    handleSubmit: handleSubmitCourse,
    formState: { errors: courseErrors },
    reset: resetCourse,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_title: '',
      course_code: '',
      credits: 3,
      min_grade: '',
      description: '',
      category: '',
      is_required: true,
    },
  });

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.put(`/api/programs/${program.id}`, {
        name: data.name,
        description: data.description || null,
        requirements_text: data.requirements_text || null,
        min_prereq_gpa: data.min_prereq_gpa || null,
        min_overall_gpa: data.min_overall_gpa || null,
        is_official: true,
        is_published: true,
      });

      if (response.data.success) {
        router.push(`/institution/programs/${program.id}`);
        router.refresh();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to update program');
      } else {
        setError('An error occurred while updating the program');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshCourses = async () => {
    try {
      const response = await axios.get(`/api/programs/${program.id}/courses`);
      if (response.data.success && response.data.data) {
        setCourses(response.data.data);
      }
    } catch (err) {
      console.error('Error refreshing courses:', err);
    }
  };

  const onSubmitCourse = async (data: CourseFormData) => {
    try {
      if (editingCourse) {
        // Update existing course
        const response = await axios.put(`/api/programs/${program.id}/courses/${editingCourse.id}`, data);
        if (response.data.success) {
          await refreshCourses();
          setEditingCourse(null);
          setShowCourseForm(false);
          setSelectedCatalogCourse('');
          resetCourse();
        }
      } else {
        // Add new course
        const response = await axios.post(`/api/programs/${program.id}/courses`, {
          ...data,
          display_order: courses.length,
          course_id: selectedCatalogCourse || null,
        });
        if (response.data.success) {
          await refreshCourses();
          setShowCourseForm(false);
          setSelectedCatalogCourse('');
          resetCourse();
        }
      }
    } catch (err) {
      console.error('Error saving course:', err);
      setError('Failed to save course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await axios.delete(`/api/programs/${program.id}/courses/${courseId}`);
      if (response.data.success) {
        setCourses(courses.filter(c => c.id !== courseId));
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
    }
  };

  const handleEditCourse = (course: RequiredCourse) => {
    setEditingCourse(course);
    resetCourse({
      course_title: course.course_title,
      course_code: course.course_code || '',
      credits: course.credits,
      min_grade: course.min_grade || '',
      description: course.description || '',
      category: course.category || '',
      is_required: course.is_required,
    });
    setShowCourseForm(true);
  };

  const handleCancelCourse = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
    setSelectedCatalogCourse('');
    resetCourse();
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <GraduationCap size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Edit Program</h1>
            <p className={styles.subtitle}>{institution.name}</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'basic' ? styles.active : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'courses' ? styles.active : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Required Classes ({courses.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'gpa' ? styles.active : ''}`}
          onClick={() => setActiveTab('gpa')}
        >
          GPA Requirements
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'meta' ? styles.active : ''}`}
          onClick={() => setActiveTab('meta')}
        >
          Meta Fields
        </button>
      </div>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className={styles.tabContent}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Program Name *</label>
              <input
                id="name"
                type="text"
                className={styles.input}
                {...register('name')}
                placeholder="e.g., Bachelor of Science in Computer Science"
              />
              {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea
                id="description"
                className={styles.textarea}
                {...register('description')}
                placeholder="Brief description of the program..."
                rows={4}
              />
              {errors.description && <span className={styles.fieldError}>{errors.description.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="requirements_text" className={styles.label}>Requirements Text</label>
              <textarea
                id="requirements_text"
                className={styles.textarea}
                {...register('requirements_text')}
                placeholder="Detailed requirements and notes..."
                rows={6}
              />
              {errors.requirements_text && (
                <span className={styles.fieldError}>{errors.requirements_text.message}</span>
              )}
            </div>
          </div>
        )}

        {/* Required Classes Tab */}
        {activeTab === 'courses' && (
          <div className={styles.tabContent}>
            <div className={styles.coursesHeader}>
              <h2 className={styles.coursesTitle}>Required Classes</h2>
              {!showCourseForm && (
                <button
                  type="button"
                  onClick={() => setShowCourseForm(true)}
                  className={styles.addButton}
                >
                  <Plus size={18} />
                  <span>Add Course</span>
                </button>
              )}
            </div>

            {/* Quick Add from Catalog */}
            {!showCourseForm && catalogCourses.length > 0 && (
              <div className={styles.quickAddSection}>
                <h3 className={styles.quickAddTitle}>Quick Add from Course Catalog</h3>
                <p className={styles.quickAddHint}>Click any course to add it to this program's requirements</p>
                <div className={styles.catalogGrid}>
                  {catalogCourses
                    .filter(catalogCourse => 
                      !courses.some(reqCourse => reqCourse.course_id === catalogCourse.id)
                    )
                    .slice(0, 6)
                    .map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={async () => {
                          try {
                            await axios.post(`/api/programs/${program.id}/courses`, {
                              course_title: course.title,
                              course_code: course.code,
                              credits: course.credits,
                              description: course.description,
                              min_grade: '',
                              category: '',
                              is_required: true,
                              display_order: courses.length,
                              course_id: course.id,
                            });
                            await refreshCourses();
                          } catch (err) {
                            console.error('Error adding course:', err);
                            setError('Failed to add course');
                          }
                        }}
                        className={styles.catalogCourseCard}
                      >
                        <div className={styles.catalogCourseCode}>{course.code}</div>
                        <div className={styles.catalogCourseTitle}>{course.title}</div>
                        <div className={styles.catalogCourseCredits}>{course.credits} CR</div>
                      </button>
                    ))}
                </div>
                {catalogCourses.filter(c => !courses.some(r => r.course_id === c.id)).length > 6 && (
                  <p className={styles.viewMoreHint}>
                    {catalogCourses.filter(c => !courses.some(r => r.course_id === c.id)).length - 6} more courses available. 
                    Use "Add Course" button to see all.
                  </p>
                )}
                {catalogCourses.filter(c => !courses.some(r => r.course_id === c.id)).length === 0 && (
                    <p className={styles.noCatalogCoursesHint}>No courses available in the catalog. Add courses to your institution's course catalog first.</p>
                )}
              </div>
            )}

            {showCourseForm && (
              <div className={styles.courseForm}>
                <h3 className={styles.courseFormTitle}>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                
                {!editingCourse && catalogCourses.length > 0 && (
                  <div className={styles.catalogSelector}>
                    <label htmlFor="catalog_course" className={styles.label}>
                      Select from Course Catalog (Optional)
                    </label>
                    <select
                      id="catalog_course"
                      value={selectedCatalogCourse}
                      onChange={(e) => {
                        const courseId = e.target.value;
                        setSelectedCatalogCourse(courseId);
                        if (courseId) {
                          const course = catalogCourses.find(c => c.id === courseId);
                          if (course) {
                            resetCourse({
                              course_title: course.title,
                              course_code: course.code,
                              credits: course.credits,
                              min_grade: '',
                              description: course.description || '',
                              category: '',
                              is_required: true,
                            });
                          }
                        }
                      }}
                      className={styles.select}
                    >
                      <option value="">-- Or create custom course --</option>
                      {catalogCourses
                        .filter(catalogCourse => 
                          !courses.some(reqCourse => reqCourse.course_id === catalogCourse.id)
                        )
                        .map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.code} - {course.title} ({course.credits} CR)
                          </option>
                        ))}
                    </select>
                    <small className={styles.fieldHint}>
                      Select a course from your catalog to auto-fill details, or leave blank to create a custom course.
                    </small>
                  </div>
                )}

                <div className={styles.courseFormGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="course_title" className={styles.label}>Course Title *</label>
                    <input
                      id="course_title"
                      type="text"
                      className={styles.input}
                      {...registerCourse('course_title')}
                      placeholder="e.g., Introduction to Programming"
                    />
                    {courseErrors.course_title && (
                      <span className={styles.fieldError}>{courseErrors.course_title.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="course_code" className={styles.label}>Course Code</label>
                    <input
                      id="course_code"
                      type="text"
                      className={styles.input}
                      {...registerCourse('course_code')}
                      placeholder="e.g., CS101"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="credits" className={styles.label}>Credits *</label>
                    <input
                      id="credits"
                      type="number"
                      step="0.5"
                      className={styles.input}
                      {...registerCourse('credits', { valueAsNumber: true })}
                    />
                    {courseErrors.credits && (
                      <span className={styles.fieldError}>{courseErrors.credits.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="min_grade" className={styles.label}>Minimum Grade</label>
                    <input
                      id="min_grade"
                      type="text"
                      className={styles.input}
                      {...registerCourse('min_grade')}
                      placeholder="e.g., C+"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="category" className={styles.label}>Category</label>
                    <input
                      id="category"
                      type="text"
                      className={styles.input}
                      {...registerCourse('category')}
                      placeholder="e.g., Core, Elective"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="is_required" className={styles.checkbox}>
                      <input
                        id="is_required"
                        type="checkbox"
                        {...registerCourse('is_required')}
                      />
                      <span>Required Course</span>
                    </label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="course_description" className={styles.label}>Description</label>
                    <textarea
                      id="course_description"
                      className={styles.textarea}
                      {...registerCourse('description')}
                      placeholder="Course description..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className={styles.courseFormActions}>
                  <button
                    type="button"
                    onClick={handleSubmitCourse(onSubmitCourse)}
                    className={styles.saveButton}
                  >
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCourse}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className={styles.coursesList}>
              {courses.length === 0 ? (
                <div className={styles.emptyState}>
                  <GraduationCap size={48} />
                  <p>No required courses added yet</p>
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className={styles.courseCard}>
                    <div className={styles.courseInfo}>
                      <div className={styles.courseHeader}>
                        <h4 className={styles.courseTitle}>
                          {course.course_code ? `${course.course_code}: ` : ''}
                          {course.course_title}
                        </h4>
                        <div className={styles.courseBadges}>
                          {course.is_required && <span className={styles.badge}>Required</span>}
                          {course.category && <span className={styles.categoryBadge}>{course.category}</span>}
                        </div>
                      </div>
                      <div className={styles.courseDetails}>
                        <span>{course.credits} credits</span>
                        {course.min_grade && <span>Min Grade: {course.min_grade}</span>}
                      </div>
                      {course.description && <p className={styles.courseDescription}>{course.description}</p>}
                    </div>
                    <div className={styles.courseActions}>
                      <button
                        type="button"
                        onClick={() => handleEditCourse(course)}
                        className={styles.editButton}
                        title="Edit course"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                        className={styles.deleteButton}
                        title="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* GPA Requirements Tab */}
        {activeTab === 'gpa' && (
          <div className={styles.tabContent}>
            <div className={styles.formGroup}>
              <label htmlFor="min_prereq_gpa" className={styles.label}>Minimum Prerequisite GPA</label>
              <input
                id="min_prereq_gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                className={styles.input}
                {...register('min_prereq_gpa', { valueAsNumber: true })}
                placeholder="e.g., 2.5"
              />
              {errors.min_prereq_gpa && (
                <span className={styles.fieldError}>{errors.min_prereq_gpa.message}</span>
              )}
              <small className={styles.fieldHint}>Required GPA for prerequisite courses</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="min_overall_gpa" className={styles.label}>Minimum Overall GPA</label>
              <input
                id="min_overall_gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                className={styles.input}
                {...register('min_overall_gpa', { valueAsNumber: true })}
                placeholder="e.g., 3.0"
              />
              {errors.min_overall_gpa && (
                <span className={styles.fieldError}>{errors.min_overall_gpa.message}</span>
              )}
              <small className={styles.fieldHint}>Required overall GPA for program admission</small>
            </div>
          </div>
        )}

        {/* Meta Fields Tab */}
        {activeTab === 'meta' && (
          <div className={styles.tabContent}>
            <div className={styles.metaInfo}>
              <div className={styles.metaField}>
                <label className={styles.metaLabel}>Institution</label>
                <p className={styles.metaValue}>{institution.name}</p>
              </div>
              <div className={styles.metaField}>
                <label className={styles.metaLabel}>Program ID</label>
                <p className={styles.metaValue}>{program.id}</p>
              </div>
              <div className={styles.metaField}>
                <label className={styles.metaLabel}>Official Program</label>
                <p className={styles.metaValue}>Yes (automatically set)</p>
              </div>
              <div className={styles.metaField}>
                <label className={styles.metaLabel}>Published Status</label>
                <p className={styles.metaValue}>Published (automatically set)</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            <Save size={18} />
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}