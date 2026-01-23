'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, BookOpen, School2, Calendar, Award, FileText } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import type { Course } from '@/types/course';
import styles from '@/styles/modules/pages/view-course.module.scss';
import axios from 'axios';

interface ViewCourseProps {
  user: User;
  course: Course;
}

export default function ViewCourse({ user, course }: ViewCourseProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/classes/${course.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/courses/${course.id}`);
      router.push('/classes');
      router.refresh();
    } catch {
      alert('Failed to delete course');
      setIsDeleting(false);
    }
  };

  // Calculate quality points for GPA
  const qualityPoints = course.grade_value ? Number(course.credits) * course.grade_value : null;

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push('/classes')}>
            <ArrowLeft size={20} strokeWidth={2} />
            <span>Back to Classes</span>
          </button>
          
          <div className={styles.actions}>
            <button 
              className={styles.editButton}
              onClick={handleEdit}
            >
              <Edit size={20} />
              <span>Edit Course</span>
            </button>
            <button 
              className={styles.deleteButton}
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={20} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.courseHeader}>
            <div className={styles.iconWrapper}>
              <BookOpen size={48} strokeWidth={2.5} />
            </div>
            <div className={styles.courseInfo}>
              <h1 className={styles.courseTitle}>{course.course_title}</h1>
              {course.course?.code && (
                <p className={styles.courseCode}>{course.course.code}</p>
              )}
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className={styles.infoGrid}>
            {/* Institution Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <School2 size={20} strokeWidth={2} />
                <h3 className={styles.cardTitle}>Institution</h3>
              </div>
              <div className={styles.cardContent}>
                {course.institution ? (
                  <>
                    <p className={styles.cardValue}>{course.institution.name}</p>
                    {course.institution.short_code && (
                      <p className={styles.cardDetail}>{course.institution.short_code}</p>
                    )}
                  </>
                ) : (
                  <p className={styles.cardEmpty}>Not specified</p>
                )}
              </div>
            </div>

            {/* Term Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <Calendar size={20} strokeWidth={2} />
                <h3 className={styles.cardTitle}>Term</h3>
              </div>
              <div className={styles.cardContent}>
                {course.term ? (
                  <>
                    <p className={styles.cardValue}>{course.term.name}</p>
                    {course.term.start_date && (
                      <p className={styles.cardDetail}>
                        {new Date(course.term.start_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </>
                ) : (
                  <p className={styles.cardEmpty}>Not specified</p>
                )}
              </div>
            </div>

            {/* Credits Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <Award size={20} strokeWidth={2} />
                <h3 className={styles.cardTitle}>Credits</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardValue}>{Number(course.credits).toFixed(1)}</p>
                <p className={styles.cardDetail}>Credit hours</p>
              </div>
            </div>

            {/* Grade Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <FileText size={20} strokeWidth={2} />
                <h3 className={styles.cardTitle}>Grade</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardValue}>
                  {course.grade || 'IP'}
                </p>
                {course.grade_value !== null && course.grade_value !== undefined ? (
                  <p className={styles.cardDetail}>{course.grade_value.toFixed(2)} GPA</p>
                ) : (
                  <p className={styles.cardDetail}>In Progress</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className={styles.detailsSection}>
            <h2 className={styles.sectionTitle}>Course Details</h2>
            
            <div className={styles.detailsGrid}>
              {qualityPoints !== null && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Quality Points:</span>
                  <span className={styles.detailValue}>{qualityPoints.toFixed(2)}</span>
                </div>
              )}
              
              {course.is_retaken && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.detailValue} ${styles.retaken}`}>Retaken</span>
                </div>
              )}
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Created:</span>
                <span className={styles.detailValue}>
                  {new Date(course.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {course.notes && (
              <div className={styles.notesSection}>
                <h3 className={styles.notesTitle}>Notes</h3>
                <p className={styles.notesContent}>{course.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowDeleteModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Delete Course?</h2>
              <p className={styles.modalMessage}>
                Are you sure you want to delete <strong>{course.course_title}</strong>? 
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Course'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
