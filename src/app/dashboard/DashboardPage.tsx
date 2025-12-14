'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, GraduationCap, Calendar, TrendingUp, LibraryBig, School2, Target, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
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

interface DashboardPageProps {
    user: User;
    stats: DashboardStats;
    onboarding: OnboardingData | null;
}

export default function DashboardPage({ user, stats, onboarding }: DashboardPageProps) {
    const router = useRouter();
    const showOnboarding = !!(onboarding && !onboarding.onboarding_completed);

    const handleOnboardingComplete = () => {
        router.refresh();
    };

    return (
        <DashboardLayout user={user}>
            <div className={styles.container}>
                {/* Main Content */}
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

                            <Link href="/scenarios" className={styles.actionCard}>
                                <div className={styles.actionIcon}><Sparkles size={48} strokeWidth={2} /></div>
                                <h4 className={styles.actionTitle}>What-If Scenarios</h4>
                                <p className={styles.actionDescription}>
                                    Plan future courses and predict outcomes
                                </p>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>

            <OnboardingModal
                isOpen={showOnboarding}
                currentStep={onboarding?.current_step || 'dashboard_intro'}
                onComplete={handleOnboardingComplete}
            />
        </DashboardLayout>
    );
}
