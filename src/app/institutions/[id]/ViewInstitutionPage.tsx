'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Globe, MapPin, BookOpen, GraduationCap, Edit, Trash2, ExternalLink } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Institution } from '@/types';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/view-institution.module.scss';
import { useState } from 'react';
import axios from 'axios';

interface Course {
  id: string;
  code?: string;
  name?: string;
  is_official: boolean;
}

interface TakenCourse {
  id: string;
  course_title: string;
  credits: number;
  grade: string | null;
  grade_value: number | null;
  term?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
}

interface Program {
  id: string;
  name: string;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
}

interface ViewInstitutionPageProps {
  user: User;
  institution: Institution;
  isOwner: boolean;
  userCourses: TakenCourse[];
  officialCourses: Course[];
  programs: Program[];
}

export default function ViewInstitutionPage({ 
  user, 
  institution, 
  isOwner,
  userCourses,
  officialCourses,
  programs
}: ViewInstitutionPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate GPA for courses at this institution
  const calculateGPA = () => {
    const validCourses = userCourses.filter(c => c.grade_value !== null && c.grade_value !== undefined);
    if (validCourses.length === 0) return null;

    const totalPoints = validCourses.reduce((sum, c) => sum + (c.grade_value! * c.credits), 0);
    const totalCredits = validCourses.reduce((sum, c) => sum + c.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
  };

  const totalCredits = userCourses.reduce((sum, c) => sum + c.credits, 0);
  const gpa = calculateGPA();

  const handleEdit = () => {
    router.push(`/institutions/${institution.id}/edit`);
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/institutions/${institution.id}`);
      showToast('Institution deleted successfully', 'success');
      router.push('/institutions');
      router.refresh();
    } catch {
      showToast('Failed to delete institution. It may have courses or programs associated with it.', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        {/* Back Button */}
        <button onClick={() => router.push('/institutions')} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Institutions
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <Building2 size={48} strokeWidth={2.5} />
            </div>
            <div>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>{institution.name}</h1>
                {!institution.is_official && (
                  <div className={styles.badge}>Custom</div>
                )}
                {institution.is_official && institution.status === 'verified' && (
                  <div className={`${styles.badge} ${styles.verified}`}>Verified</div>
                )}
              </div>
              {institution.short_code && (
                <p className={styles.shortCode}>{institution.short_code}</p>
              )}
            </div>
          </div>

          {isOwner && (
            <div className={styles.headerActions}>
              <button onClick={handleEdit} className={styles.editButton}>
                <Edit size={18} />
                Edit
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className={styles.deleteButton}
                disabled={userCourses.length > 0 || programs.length > 0}
                title={userCourses.length > 0 || programs.length > 0 ? 'Cannot delete institution with courses or programs' : 'Delete institution'}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Institution Details */}
        <div className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Information</h2>
          <div className={styles.infoGrid}>
            {institution.country && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <MapPin size={18} />
                  Country
                </div>
                <div className={styles.infoValue}>{institution.country}</div>
              </div>
            )}
            
            {institution.website_url && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <Globe size={18} />
                  Website
                </div>
                <div className={styles.infoValue}>
                  <a 
                    href={institution.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.websiteLink}
                  >
                    Visit Website
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <BookOpen size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{userCourses.length}</div>
              <div className={styles.statLabel}>Courses Taken</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <GraduationCap size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalCredits.toFixed(1)}</div>
              <div className={styles.statLabel}>Total Credits</div>
            </div>
          </div>

          {gpa && (
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Building2 size={24} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{gpa}</div>
                <div className={styles.statLabel}>Institution GPA</div>
              </div>
            </div>
          )}

          {programs.length > 0 && (
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <BookOpen size={24} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{programs.length}</div>
                <div className={styles.statLabel}>Programs</div>
              </div>
            </div>
          )}
        </div>

        {/* Your Courses */}
        {userCourses.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <BookOpen size={24} />
              Your Courses at {institution.short_code || institution.name}
            </h2>
            
            <div className={styles.coursesTable}>
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Term</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userCourses.map((course) => (
                    <tr key={course.id}>
                      <td className={styles.courseTitle}>{course.course_title}</td>
                      <td>{course.credits.toFixed(1)}</td>
                      <td>
                        <span className={styles.gradeBadge}>
                          {course.grade || 'IP'}
                        </span>
                      </td>
                      <td>{course.term?.name || '—'}</td>
                      <td>
                        <button
                          onClick={() => router.push(`/classes/${course.id}`)}
                          className={styles.viewButton}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Programs */}
        {programs.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <GraduationCap size={24} />
              Programs at {institution.short_code || institution.name}
            </h2>
            
            <div className={styles.programsGrid}>
              {programs.map((program) => (
                <div 
                  key={program.id} 
                  className={styles.programCard}
                  onClick={() => router.push(`/programs/${program.id}`)}
                >
                  <h3 className={styles.programName}>{program.name}</h3>
                  <div className={styles.programMeta}>
                    {program.min_prereq_gpa && (
                      <div className={styles.programDetail}>
                        Min Prereq GPA: {program.min_prereq_gpa.toFixed(2)}
                      </div>
                    )}
                    {program.min_overall_gpa && (
                      <div className={styles.programDetail}>
                        Min Overall GPA: {program.min_overall_gpa.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Courses (if available) */}
        {institution.is_official && officialCourses.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <BookOpen size={24} />
              Course Catalog (Sample)
            </h2>
            <p className={styles.sectionDescription}>
              Showing first 50 courses from the official catalog
            </p>
            
            <div className={styles.catalogGrid}>
              {officialCourses.map((course) => (
                <div key={course.id} className={styles.catalogItem}>
                  <div className={styles.courseCode}>{course.code}</div>
                  <div className={styles.courseName}>{course.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userCourses.length === 0 && programs.length === 0 && officialCourses.length === 0 && (
          <div className={styles.empty}>
            <BookOpen size={64} strokeWidth={1.5} />
            <h3>No Data Available</h3>
            <p>You haven't added any courses from this institution yet.</p>
            <button 
              onClick={() => router.push('/classes')}
              className={styles.addButton}
            >
              Add Courses
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.modal} onClick={() => setShowDeleteConfirm(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>Delete Institution?</h3>
              <p className={styles.modalText}>
                Are you sure you want to delete <strong>{institution.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className={styles.cancelButton}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    handleDelete();
                  }}
                  className={styles.confirmDeleteButton}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
