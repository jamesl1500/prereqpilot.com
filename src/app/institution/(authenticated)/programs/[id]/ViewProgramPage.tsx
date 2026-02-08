'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Institution } from '@/types/institution';
import { ArrowLeft, Edit, BookOpen, GraduationCap } from 'lucide-react';
import styles from '@/styles/modules/pages/institution-program-view.module.scss';

interface Program {
  id: string;
  name: string;
  institution: string | null;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
  created_at: string;
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
}

interface ViewProgramPageProps {
  institution: Institution;
  program: Program;
  requiredCourses: RequiredCourse[];
}

export default function ViewProgramPage({ institution, program, requiredCourses }: ViewProgramPageProps) {
  const router = useRouter();

  const requiredCount = requiredCourses.filter(c => c.is_required).length;
  const optionalCount = requiredCourses.filter(c => !c.is_required).length;
  const totalCredits = requiredCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button onClick={() => router.push('/institution/programs')} className={styles.backButton}>
        <ArrowLeft size={20} strokeWidth={2} />
        Back to Programs
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <GraduationCap size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>{program.name}</h1>
            <p className={styles.subtitle}>{institution.name}</p>
          </div>
        </div>
        <Link href={`/institution/programs/${program.id}/edit`} className={styles.editButton}>
          <Edit size={20} strokeWidth={2} />
          Edit Program
        </Link>
      </div>

      {/* Program Details */}
      <div className={styles.detailsSection}>
        <h2 className={styles.sectionTitle}>Program Requirements</h2>
        <div className={styles.detailsGrid}>
          {program.min_prereq_gpa && (
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Min Prerequisite GPA</span>
              <span className={styles.detailValue}>{program.min_prereq_gpa.toFixed(2)}</span>
            </div>
          )}
          {program.min_overall_gpa && (
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Min Overall GPA</span>
              <span className={styles.detailValue}>{program.min_overall_gpa.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>Required Courses</span>
            <span className={styles.detailValue}>{requiredCount}</span>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>Optional Courses</span>
            <span className={styles.detailValue}>{optionalCount}</span>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>Total Credits</span>
            <span className={styles.detailValue}>{totalCredits}</span>
          </div>
        </div>
      </div>

      {/* Required Courses */}
      <div className={styles.coursesSection}>
        <h2 className={styles.sectionTitle}>Required Courses</h2>
        {requiredCourses.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={48} strokeWidth={1.5} />
            <p>No courses added yet</p>
            <Link href={`/institution/programs/${program.id}/edit`} className={styles.emptyButton}>
              Add Courses
            </Link>
          </div>
        ) : (
          <div className={styles.coursesList}>
            {requiredCourses.map((course) => (
              <div key={course.id} className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <div>
                    <h3 className={styles.courseTitle}>{course.course_title}</h3>
                    {course.course_code && (
                      <span className={styles.courseCode}>{course.course_code}</span>
                    )}
                  </div>
                  <div className={styles.courseBadges}>
                    {course.is_required ? (
                      <span className={styles.requiredBadge}>Required</span>
                    ) : (
                      <span className={styles.optionalBadge}>Optional</span>
                    )}
                  </div>
                </div>
                
                {course.description && (
                  <p className={styles.courseDescription}>{course.description}</p>
                )}
                
                <div className={styles.courseDetails}>
                  <span className={styles.courseDetail}>
                    <strong>Credits:</strong> {course.credits}
                  </span>
                  {course.min_grade && (
                    <span className={styles.courseDetail}>
                      <strong>Min Grade:</strong> {course.min_grade}
                    </span>
                  )}
                  {course.category && (
                    <span className={styles.courseDetail}>
                      <strong>Category:</strong> {course.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
