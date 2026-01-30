'use client';

import type { User } from '@supabase/supabase-js';
import type { Institution, UserRole } from '@/types/institution';
import Link from 'next/link';
import { useState } from 'react';
import styles from '@/styles/modules/pages/institution-dashboard.module.scss';
import { Course, Program } from '@/types';

interface InstitutionDashboardProps {
  institution: Institution;
  user: User;
  role: 'institution_admin' | 'institution_staff';
  stats: {
    program_count?: number;
    course_count?: number;
    application_count?: number;
    active_students?: number;
  };
  recentPrograms: Program[];
  recentCourses: Course[];
  pendingApplications: any[];
}

export function InstitutionDashboard({
  institution,
  user,
  role,
  stats,
  recentPrograms,
  recentCourses,
  pendingApplications,
}: InstitutionDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'courses'>('overview');

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.institutionInfo}>
            {institution.logo_url && (
              <img src={institution.logo_url} alt={institution.name} className={styles.logo} />
            )}
            <div>
              <h1 className={styles.institutionName}>{institution.name}</h1>
              <p className={styles.institutionDomain}>{institution.domain}</p>
            </div>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.email}</span>
            <span className={styles.userRole}>
              {role === 'institution_admin' ? 'Administrator' : 'Staff'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={styles.nav}>
        <button
          className={activeTab === 'overview' ? styles.active : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'programs' ? styles.active : ''}
          onClick={() => setActiveTab('programs')}
        >
          Programs ({stats.program_count || 0})
        </button>
        <button
          className={activeTab === 'courses' ? styles.active : ''}
          onClick={() => setActiveTab('courses')}
        >
          Courses ({stats.course_count || 0})
        </button>
      </nav>

      {/* Content */}
      <main className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Statistics */}
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{stats.program_count || 0}</div>
                  <div className={styles.statLabel}>{stats.program_count === 1 ? 'Program' : 'Programs'}</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{stats.course_count || 0}</div>
                  <div className={styles.statLabel}>{stats.course_count === 1 ? 'Course' : 'Courses'}</div>
                </div>
              </div>

            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionCards}>
                <Link href="/institution/programs/new" className={styles.actionCard}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Create Program</span>
                </Link>
                <Link href="/institution/courses/new" className={styles.actionCard}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Course</span>
                </Link>
                <Link href="/institution/staff" className={styles.actionCard}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  <span>Manage Staff</span>
                </Link>
                <Link href="/institution/profile" className={styles.actionCard}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m5.656-14.656l-4.242 4.242m-5.656 5.656l-4.242 4.242M23 12h-6m-6 0H1m18.364-5.656l-4.242 4.242m-5.656 5.656l-4.242 4.242" />
                  </svg>
                  <span>Profile</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <h2 className={styles.sectionTitle}>Pending Applications</h2>
              {pendingApplications.length > 0 ? (
                <div className={styles.applicationsList}>
                  {pendingApplications.slice(0, 5).map((app) => (
                    <div key={app.id} className={styles.applicationItem}>
                      <div className={styles.appInfo}>
                        <div className={styles.appProgram}>{app.program_requirements?.name}</div>
                        <div className={styles.appStudent}>{app.profiles?.full_name || app.profiles?.email}</div>
                      </div>
                      <div className={styles.appDate}>
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </div>
                      <Link href={`/institution/applications/${app.id}`} className={styles.appLink}>
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No pending applications</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className={styles.programs}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Programs</h2>
              <Link href="/institution/programs/new" className={styles.addButton}>
                + Add Program
              </Link>
            </div>
            {recentPrograms.length > 0 ? (
              <div className={styles.itemsList}>
                {recentPrograms.map((program) => (
                  <div key={program.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{program.name}</div>
                      <div className={styles.itemMeta}>
                        {program.program_type ?? 'Degree'} • {program.is_published ? 'Published' : 'Draft'}
                      </div>
                    </div>
                    <Link href={`/institution/programs/${program.id}`} className={styles.itemLink}>
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No programs yet. Create your first program to get started.</p>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className={styles.courses}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Courses</h2>
              <Link href="/institution/courses/new" className={styles.addButton}>
                + Add Course
              </Link>
            </div>
            {recentCourses.length > 0 ? (
              <div className={styles.itemsList}>
                {recentCourses.map((course) => (
                  <div key={course.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>
                        {course.course_number} - {course.name}
                      </div>
                      <div className={styles.itemMeta}>{course.department}</div>
                    </div>
                    <Link href={`/institution/courses/${course.id}`} className={styles.itemLink}>
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No courses yet. Add your first course to get started.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
