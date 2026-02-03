'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Save } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import type { ProgramRequirement, ProgramRequiredCourse } from '@/services/program-requirement-service';
import type { Institution } from '@/types/institution';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/program-edit.module.scss';

interface ProgramEditPageProps {
  program: ProgramRequirement;
  requiredCourses: ProgramRequiredCourse[];
  user: User;
  userInstitutions: Institution[];
  officialInstitutions: Institution[];
}

export default function ProgramEditPage({ program, requiredCourses, user, userInstitutions, officialInstitutions }: ProgramEditPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ProgramRequiredCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Program form state
  const [programForm, setProgramForm] = useState({
    name: program.name || '',
    institution_id: program.institution_id || '',
    min_prereq_gpa: program.min_prereq_gpa?.toString() || '',
    min_overall_gpa: program.min_overall_gpa?.toString() || '',
  });

  const handleSaveProgram = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/programs/${program.id}?type=requirement`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: programForm.name,
          institution_id: programForm.institution_id || null,
          min_prereq_gpa: programForm.min_prereq_gpa ? parseFloat(programForm.min_prereq_gpa) : null,
          min_overall_gpa: programForm.min_overall_gpa ? parseFloat(programForm.min_overall_gpa) : null,
        }),
      });

      if (response.ok) {
        router.refresh();
        showToast('Program updated successfully!', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to update program', 'error');
      }
    } catch (error) {
      showToast('Failed to update program', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this required course?')) return;

    try {
      const response = await fetch(`/api/programs/${program.id}/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Course deleted successfully', 'success');
        router.refresh();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to delete course', 'error');
      }
    } catch (error) {
      showToast('Failed to delete course', 'error');
    }
  };

  // Group courses by category
  const coursesByCategory = requiredCourses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(course);
    return acc;
  }, {} as Record<string, ProgramRequiredCourse[]>);

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        <button onClick={() => router.push('/programs')} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Programs
        </button>

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Edit Program</h1>
          <p className={styles.subtitle}>Update program details and manage requirements</p>
        </div>
      </div>

      {/* Program Details Form */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Program Information</h2>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Program Name *</label>
            <input
              type="text"
              id="name"
              value={programForm.name}
              onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
              placeholder="e.g., Nursing School - ADN Program"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="institution_id">Institution</label>
            <select
              id="institution_id"
              value={programForm.institution_id}
              onChange={(e) => setProgramForm({ ...programForm, institution_id: e.target.value })}
              className={styles.select}
            >
              <option value="">Select institution...</option>
              {userInstitutions.length > 0 && (
                <optgroup label="Your Institutions">
                  {userInstitutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} {inst.short_code ? `(${inst.short_code})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {officialInstitutions.length > 0 && (
                <optgroup label="Official Institutions">
                  {officialInstitutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} {inst.short_code ? `(${inst.short_code})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="min_prereq_gpa">Minimum Prerequisite GPA</label>
              <input
                type="number"
                id="min_prereq_gpa"
                value={programForm.min_prereq_gpa}
                onChange={(e) => setProgramForm({ ...programForm, min_prereq_gpa: e.target.value })}
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g., 3.00"
              />
              <span className={styles.fieldHint}>GPA required for prerequisite courses</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="min_overall_gpa">Minimum Overall GPA</label>
              <input
                type="number"
                id="min_overall_gpa"
                value={programForm.min_overall_gpa}
                onChange={(e) => setProgramForm({ ...programForm, min_overall_gpa: e.target.value })}
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g., 2.75"
              />
              <span className={styles.fieldHint}>Overall cumulative GPA required</span>
            </div>
          </div>

          <button
            onClick={handleSaveProgram}
            className={styles.saveButton}
            disabled={isSaving || !programForm.name}
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : 'Save Program Info'}
          </button>
        </div>
      </div>

      {/* Required Courses Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Required Courses (Prerequisites)</h2>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className={styles.addButton}
          >
            <Plus size={20} />
            Add Course
          </button>
        </div>

        {Object.keys(coursesByCategory).length === 0 ? (
          <div className={styles.emptyState}>
            <p>No required courses added yet.</p>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className={styles.emptyAddButton}
            >
              Add Your First Course
            </button>
          </div>
        ) : (
          Object.entries(coursesByCategory).map(([category, courses]) => (
            <div key={category} className={styles.categoryBlock}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              
              <table className={styles.coursesTable}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Credits</th>
                    <th>Min Grade</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div className={styles.courseTitle}>
                          {course.course_title}
                          {course.description && (
                            <span className={styles.courseDescription}>
                              {course.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{course.course_code || '—'}</td>
                      <td>{course.credits.toFixed(1)}</td>
                      <td>{course.min_grade || '—'}</td>
                      <td>
                        <span className={course.is_required ? styles.requiredBadge : styles.optionalBadge}>
                          {course.is_required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.courseActions}>
                          <button
                            onClick={() => setEditingCourse(course)}
                            className={styles.editButton}
                            title="Edit course"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className={styles.deleteButton}
                            title="Delete course"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Course Modal */}
      {(showAddCourseModal || editingCourse) && (
        <RequiredCourseModal
          programId={program.id}
          course={editingCourse}
          onClose={() => {
            setShowAddCourseModal(false);
            setEditingCourse(null);
          }}
          onSuccess={() => {
            setShowAddCourseModal(false);
            setEditingCourse(null);
            router.refresh();
          }}
        />
      )}
      </div>
    </DashboardLayout>
  );
}

// Modal for adding/editing required courses
function RequiredCourseModal({
  programId,
  course,
  onClose,
  onSuccess,
}: {
  programId: string;
  course: ProgramRequiredCourse | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    course_title: course?.course_title || '',
    course_code: course?.course_code || '',
    credits: course?.credits?.toString() || '0',
    min_grade: course?.min_grade || '',
    description: course?.description || '',
    category: course?.category || '',
    is_required: course?.is_required ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = course
        ? `/api/programs/${programId}/courses/${course.id}`
        : `/api/programs/${programId}/courses`;
      
      const method = course ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          credits: parseFloat(formData.credits),
        }),
      });

      if (response.ok) {
        showToast(course ? 'Course updated successfully' : 'Course added successfully', 'success');
        onSuccess();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save course', 'error');
      }
    } catch (error) {
      showToast('Failed to save course', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          {course ? 'Edit Required Course' : 'Add Required Course'}
        </h2>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="course_title">Course Title *</label>
            <input
              type="text"
              id="course_title"
              value={formData.course_title}
              onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
              required
              placeholder="e.g., Anatomy & Physiology I"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="course_code">Course Code</label>
              <input
                type="text"
                id="course_code"
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                placeholder="e.g., BIO 201"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="credits">Credits *</label>
              <input
                type="number"
                id="credits"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                step="0.1"
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="min_grade">Minimum Grade</label>
              <input
                type="text"
                id="min_grade"
                value={formData.min_grade}
                onChange={(e) => setFormData({ ...formData, min_grade: e.target.value })}
                placeholder="e.g., C+"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Science Courses"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Optional notes about this requirement"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              />
              <span>This is a required course (uncheck if optional/elective)</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
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
              {isSubmitting ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
