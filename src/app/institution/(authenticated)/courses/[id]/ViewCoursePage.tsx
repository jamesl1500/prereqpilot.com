'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import type { Institution } from '@/types/institution';
import { ArrowLeft, Edit, BookOpen, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/institution-course-view.module.scss';

interface Course {
  id: string;
  institution_id: string;
  code: string;
  title: string;
  credits: number;
  description: string | null;
  department: string | null;
  level: string | null;
  prerequisites: string | null;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

interface ProgramUsage {
  id: string;
  min_grade: string | null;
  is_required: boolean;
  category: string | null;
  program_requirements: {
    id: string;
    name: string;
  }[] | null;
}

interface ViewCoursePageProps {
  institution: Institution;
  course: Course;
  programUsages: ProgramUsage[];
}

export default function ViewCoursePage({ institution, course, programUsages }: ViewCoursePageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/institution/courses/${course.id}`);
      showToast('Course deleted successfully', 'success');
      router.push('/institution/courses');
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.error || 'Failed to delete course', 'error');
      }
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getLevelLabel = (level: string | null) => {
    if (!level) return null;
    const labels: Record<string, string> = {
      '100': '100 - Introductory',
      '200': '200 - Lower Division',
      '300': '300 - Upper Division',
      '400': '400 - Advanced',
      '500': '500 - Graduate',
    };
    return labels[level] || level;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <div className={styles.codeTitle}>
              <span className={styles.courseCode}>{course.code}</span>
              {course.is_official && (
                <span className={styles.officialBadge}>Official</span>
              )}
            </div>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.subtitle}>{institution.name}</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/institution/courses/${course.id}/edit`} className={styles.editButton}>
            <Edit size={20} strokeWidth={2} />
            Edit Course
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={styles.deleteButton}
            disabled={isDeleting}
          >
            <Trash2 size={20} strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <AlertCircle size={48} strokeWidth={2} />
            </div>
            <h2 className={styles.modalTitle}>Delete Course?</h2>
            <p className={styles.modalText}>
              Are you sure you want to delete <strong>{course.code} - {course.title}</strong>?
              {programUsages.length > 0 && (
                <span className={styles.warningText}>
                  This course is used in {programUsages.length} program(s). 
                  Deleting it will remove it from all program requirements.
                </span>
              )}
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.modalCancel}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={styles.modalConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Details */}
      <div className={styles.detailsSection}>
        <h2 className={styles.sectionTitle}>Course Information</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>Credits</span>
            <span className={styles.detailValue}>{course.credits}</span>
          </div>
          {course.department && (
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Department</span>
              <span className={styles.detailValue}>{course.department}</span>
            </div>
          )}
          {course.level && (
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Level</span>
              <span className={styles.detailValue}>{getLevelLabel(course.level)}</span>
            </div>
          )}
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>Added On</span>
            <span className={styles.detailValueSmall}>{formatDate(course.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <div className={styles.descriptionCard}>
            <p className={styles.descriptionText}>{course.description}</p>
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {course.prerequisites && (
        <div className={styles.prerequisitesSection}>
          <h2 className={styles.sectionTitle}>Prerequisites</h2>
          <div className={styles.prerequisitesCard}>
            <p className={styles.prerequisitesText}>{course.prerequisites}</p>
          </div>
        </div>
      )}

      {/* Program Usages */}
      <div className={styles.programsSection}>
        <h2 className={styles.sectionTitle}>Used in Programs</h2>
        {programUsages.length === 0 ? (
          <div className={styles.emptyState}>
            <GraduationCap size={48} strokeWidth={1.5} />
            <p>This course is not used in any programs yet</p>
            <Link href="/institution/programs" className={styles.emptyButton}>
              Manage Programs
            </Link>
          </div>
        ) : (
          <div className={styles.programsList}>
            {programUsages.map((usage) => {
              const requirement = usage.program_requirements?.[0];

              if (!requirement) {
                return null;
              }

              return (
                <div key={usage.id} className={styles.programCard}>
                  <div className={styles.programHeader}>
                    <Link
                      href={`/institution/programs/${requirement.id}`}
                      className={styles.programName}
                    >
                      {requirement.name}
                    </Link>
                    <div className={styles.programBadges}>
                      {usage.is_required ? (
                        <span className={styles.requiredBadge}>Required</span>
                      ) : (
                        <span className={styles.optionalBadge}>Elective</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.programDetails}>
                    {usage.min_grade && (
                      <span className={styles.programDetail}>
                        <strong>Min Grade:</strong> {usage.min_grade}
                      </span>
                    )}
                    {usage.category && (
                      <span className={styles.programDetail}>
                        <strong>Category:</strong> {usage.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
