'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, GraduationCap, Calendar, TrendingUp, LibraryBig, School2, Target, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import ProgramMatchWidget from '@/components/shared/ProgramMatchWidget';
import GPAProjector from '@/components/shared/GPAProjector';
import styles from '@/styles/modules/pages/dashboard.module.scss';

interface DashboardStats {
  totalCourses: number;
  totalCredits: number;
  totalTerms: number;
  overallGPA: number | null;
  prereqGPA: number | null;
}

interface OnboardingData {
  onboarding_completed: boolean;
  current_step: string | null;
  steps_completed: string[];
}

interface RequiredCourse {
  id: string;
  course_title: string;
  is_required: boolean;
  min_grade: string | null;
  credits: number;
}

interface Program {
  id: string;
  name: string;
  min_overall_gpa: number | null;
  min_prereq_gpa: number | null;
  institution: { name: string; short_code: string | null } | null;
  program_required_courses: RequiredCourse[];
}

interface TakenCourse {
  id: string;
  course_title: string;
  credits: number;
  grade_value: number | null;
}

interface DashboardClientProps {
  user: User;
  stats: DashboardStats;
  onboarding: OnboardingData | null;
  programs: Program[];
  takenCourses: TakenCourse[];
  scenarioCount: number;
}

export default function DashboardClient({ user, stats, onboarding, programs, takenCourses, scenarioCount }: DashboardClientProps) {
  const router = useRouter();
  const showOnboarding = !!(onboarding && !onboarding.onboarding_completed);

  const handleOnboardingComplete = () => {
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>
            Welcome back, {user.user_metadata?.name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className={styles.welcomeSubtitle}>
            Track your academic progress and plan your course journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><BookOpen size={32} strokeWidth={2.5} /></div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Courses Taken</p>
              <p className={styles.statValue}>{stats.totalCourses}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}><GraduationCap size={32} strokeWidth={2.5} /></div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Credits</p>
              <p className={styles.statValue}>{stats.totalCredits.toFixed(1)}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}><Calendar size={32} strokeWidth={2.5} /></div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Terms</p>
              <p className={styles.statValue}>{stats.totalTerms}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}><TrendingUp size={32} strokeWidth={2.5} /></div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Overall GPA</p>
              <p className={styles.statValue}>
                {stats.overallGPA ? stats.overallGPA.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Program Match Widget */}
        <ProgramMatchWidget
          programs={programs}
          takenCourses={takenCourses}
          overallGPA={stats.overallGPA}
        />

        {/* GPA Projector */}
        {stats.totalCourses > 0 && (
          <GPAProjector
            currentCourses={takenCourses}
            currentGPA={stats.overallGPA}
          />
        )}

        {/* What-If Scenarios Feature Banner */}
        <div className={styles.scenarioBanner}>
          <div className={styles.scenarioBannerContent}>
            <div className={styles.scenarioBannerIcon}>
              <Sparkles size={32} strokeWidth={2} />
            </div>
            <div>
              <h3 className={styles.scenarioBannerTitle}>Simulate Your Academic Future</h3>
              <p className={styles.scenarioBannerText}>
                What if you retook that class? What if you added a minor?
                What-If Scenarios let you model different course paths and see the GPA impact
                before you commit.
              </p>
            </div>
          </div>
          <div className={styles.scenarioBannerActions}>
            {scenarioCount > 0 && (
              <span className={styles.scenarioBannerCount}>{scenarioCount} scenario{scenarioCount !== 1 ? 's' : ''}</span>
            )}
            <Link href="/scenarios" className={styles.scenarioBannerBtn}>
              {scenarioCount === 0 ? 'Create Your First Scenario' : 'View Scenarios'} →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actionsSection}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.actionsGrid}>
            <Link href="/classes" className={styles.actionCard}>
              <div className={styles.actionIcon}><LibraryBig size={48} strokeWidth={2} /></div>
              <h4 className={styles.actionTitle}>My Classes</h4>
              <p className={styles.actionDescription}>
                View and manage your taken courses
              </p>
            </Link>

            <Link href="/institutions" className={styles.actionCard}>
              <div className={styles.actionIcon}><School2 size={48} strokeWidth={2} /></div>
              <h4 className={styles.actionTitle}>Institutions</h4>
              <p className={styles.actionDescription}>
                Browse available institutions and courses
              </p>
            </Link>

            <Link href="/programs" className={styles.actionCard}>
              <div className={styles.actionIcon}><Target size={48} strokeWidth={2} /></div>
              <h4 className={styles.actionTitle}>Program Requirements</h4>
              <p className={styles.actionDescription}>
                Check your progress toward program goals
              </p>
            </Link>

            <Link href="/plans" className={styles.actionCard}>
              <div className={styles.actionIcon}><Calendar size={48} strokeWidth={2} /></div>
              <h4 className={styles.actionTitle}>Academic Plans</h4>
              <p className={styles.actionDescription}>
                Plan your semester-by-semester course sequence
              </p>
            </Link>
          </div>
        </div>
      </main>

      <OnboardingModal
        isOpen={showOnboarding}
        currentStep={onboarding?.current_step || 'dashboard_intro'}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
