'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Calendar, GraduationCap, Award } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Course } from '@/types/course';
import type { Institution } from '@/types/institution';
import TranscriptUpload from '@/components/transcript/TranscriptUpload';
import styles from '@/styles/modules/pages/transcript.module.scss';

interface TranscriptPageProps {
  user: User;
  takenCourses: Course[];
  institutions: Institution[];
}

interface InstitutionGroup {
  institution: Institution | null;
  courses: Course[];
  totalCredits: number;
  gpa: number | null;
}

export default function TranscriptPage({ takenCourses, institutions }: TranscriptPageProps) {
  const router = useRouter();
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');

  // Group courses by institution
  const groupedByInstitution: InstitutionGroup[] = [];
  
  // Get unique institution IDs from taken courses
  const institutionIds = Array.from(new Set(takenCourses.map(c => c.institution_id).filter(Boolean)));
  
  // Add institutions with courses
  institutionIds.forEach(instId => {
    const institution = institutions.find(i => i.id === instId) || null;
    const institutionCourses = takenCourses.filter(c => c.institution_id === instId);
    const totalCredits = institutionCourses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
    const coursesWithGrades = institutionCourses.filter(c => c.grade_value !== null && !c.is_retaken);
    const gpa = coursesWithGrades.length > 0
      ? coursesWithGrades.reduce((sum, c) => sum + Number(c.grade_value || 0), 0) / coursesWithGrades.length
      : null;

    groupedByInstitution.push({
      institution,
      courses: institutionCourses.sort((a, b) => {
        // Sort by term name, then by course title
        const termCompare = (a.term?.name || '').localeCompare(b.term?.name || '');
        return termCompare !== 0 ? termCompare : a.course_title.localeCompare(b.course_title);
      }),
      totalCredits,
      gpa,
    });
  });

  // Add courses without institution
  const coursesWithoutInstitution = takenCourses.filter(c => !c.institution_id);
  if (coursesWithoutInstitution.length > 0) {
    const totalCredits = coursesWithoutInstitution.reduce((sum, c) => sum + Number(c.credits || 0), 0);
    const coursesWithGrades = coursesWithoutInstitution.filter(c => c.grade_value !== null && !c.is_retaken);
    const gpa = coursesWithGrades.length > 0
      ? coursesWithGrades.reduce((sum, c) => sum + Number(c.grade_value || 0), 0) / coursesWithGrades.length
      : null;

    groupedByInstitution.push({
      institution: null,
      courses: coursesWithoutInstitution,
      totalCredits,
      gpa,
    });
  }

  // Sort by institution name
  groupedByInstitution.sort((a, b) => {
    const nameA = a.institution?.name || 'Unspecified Institution';
    const nameB = b.institution?.name || 'Unspecified Institution';
    return nameA.localeCompare(nameB);
  });

  // Calculate overall stats
  const allCoursesFiltered = selectedInstitution === 'all' 
    ? takenCourses 
    : takenCourses.filter(c => c.institution_id === selectedInstitution || (!c.institution_id && selectedInstitution === 'none'));
  
  const totalCredits = allCoursesFiltered.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  const coursesWithGrades = allCoursesFiltered.filter(c => c.grade_value !== null && !c.is_retaken);
  const overallGPA = coursesWithGrades.length > 0
    ? coursesWithGrades.reduce((sum, c) => sum + Number(c.grade_value || 0), 0) / coursesWithGrades.length
    : null;

  const filteredGroups = selectedInstitution === 'all' 
    ? groupedByInstitution 
    : groupedByInstitution.filter(g => 
        g.institution?.id === selectedInstitution || 
        (!g.institution && selectedInstitution === 'none')
      );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Unofficial Transcript</h1>
          <p className={styles.subtitle}>
            Academic record organized by institution
          </p>
        </div>
      </div>

      {/* Transcript Upload */}
      <TranscriptUpload onImportComplete={() => router.refresh()} />

      {/* Overall Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Building2 size={24} strokeWidth={2} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Institutions</div>
            <div className={styles.summaryValue}>{groupedByInstitution.length}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <GraduationCap size={24} strokeWidth={2} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Total Courses</div>
            <div className={styles.summaryValue}>{allCoursesFiltered.length}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Calendar size={24} strokeWidth={2} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Total Credits</div>
            <div className={styles.summaryValue}>{totalCredits.toFixed(1)}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Award size={24} strokeWidth={2} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Overall GPA</div>
            <div className={styles.summaryValue}>
              {overallGPA !== null ? overallGPA.toFixed(2) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Institution Filter */}
      <div className={styles.filters}>
        <label className={styles.filterLabel}>Filter by Institution:</label>
        <select
          value={selectedInstitution}
          onChange={(e) => setSelectedInstitution(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Institutions</option>
          {institutionIds.map(id => {
            const inst = institutions.find(i => i.id === id);
            return inst ? (
              <option key={id} value={id || ''}>{inst.name}</option>
            ) : null;
          })}
          {coursesWithoutInstitution.length > 0 && (
            <option value="none">Unspecified Institution</option>
          )}
        </select>
      </div>

      {/* Institution Groups */}
      {filteredGroups.length === 0 ? (
        <div className={styles.empty}>
          <Building2 size={64} strokeWidth={1.5} />
          <h3>No courses found</h3>
          <p>Add courses to your institutions to see your transcript.</p>
        </div>
      ) : (
        <div className={styles.institutions}>
          {filteredGroups.map((group, idx) => (
            <div key={idx} className={styles.institutionBlock}>
              <div 
                className={styles.institutionHeader}
                onClick={() => group.institution && router.push(`/institutions/${group.institution.id}`)}
                style={group.institution ? { cursor: 'pointer' } : undefined}
              >
                <div>
                  <h2 className={styles.institutionName}>
                    {group.institution?.name || 'Unspecified Institution'}
                  </h2>
                  {group.institution?.short_code && (
                    <p className={styles.institutionCode}>{group.institution.short_code}</p>
                  )}
                </div>
                <div className={styles.institutionStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Credits:</span>
                    <span className={styles.statValue}>{group.totalCredits.toFixed(1)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>GPA:</span>
                    <span className={styles.statValue}>
                      {group.gpa !== null ? group.gpa.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>Term</th>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {group.courses.map((course) => (
                    <tr 
                      key={course.id} 
                      className={`${styles.tableRow} ${course.is_retaken ? styles.retaken : ''}`}
                    >
                      <td className={styles.termCell}>{course.term?.name || 'N/A'}</td>
                      <td className={styles.courseCell}>
                        <div className={styles.courseTitle}>{course.course_title}</div>
                        {course.course?.code && (
                          <div className={styles.courseCode}>{course.course.code}</div>
                        )}
                      </td>
                      <td className={styles.creditsCell}>{Number(course.credits || 0).toFixed(1)}</td>
                      <td className={styles.gradeCell}>{course.grade || 'N/A'}</td>
                      <td className={styles.statusCell}>
                        {course.is_retaken ? (
                          <span className={styles.retakenBadge}>Retaken</span>
                        ) : (
                          <span className={styles.completedBadge}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
