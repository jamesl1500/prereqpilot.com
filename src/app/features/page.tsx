import Link from 'next/link';
import styles from '@/styles/modules/pages/features.module.scss';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { Target, TrendingUp, Calculator, Lightbulb, BookOpen, Users, Clock, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features — Graduate School & Program Planning Tools',
  description:
    'Explore PrereqPilot\'s free tools for college students: grad school eligibility checker, GPA calculator, prerequisite tracker, academic plan builder, and scenario simulator.',
  alternates: { canonical: 'https://www.prereqpilot.com/features' },
  openGraph: {
    title: 'Features — Graduate School & Program Planning Tools | PrereqPilot',
    description:
      'Everything you need to plan your path to grad school: check GPA requirements, track prerequisites, simulate academic scenarios, and build your roadmap.',
    url: 'https://www.prereqpilot.com/features',
    type: 'website',
  },
};

export default async function FeaturesPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className={styles.container}>
      <PublicHeader user={user} />
      
      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Everything You Need to<br />
            <span className={styles.highlight}>Master Your Academic Journey</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Powerful tools designed to help students plan smarter, track progress easier, 
            and reach their goals faster—all in one place.
          </p>
          {!user && (
            <Link href="/signup" className={styles.ctaButton}>
              Start Planning Free
            </Link>
          )}
        </div>
      </header>

      {/* Main Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionContent}>
          <div className={styles.featuresList}>
            
            {/* GPA Calculation & Tracking */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <Calculator size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>Smart GPA Calculator</h2>
                <p className={styles.featureDescription}>
                  Track your GPA in real-time with our intelligent calculator. Upload your transcript 
                  or manually add courses, and watch your GPA update instantly. See cumulative, 
                  semester-by-semester, and program-specific GPAs all in one dashboard.
                </p>
                <ul className={styles.featureBullets}>
                  <li>Automatic GPA calculation from transcripts</li>
                  <li>Track multiple institutions and transfer credits</li>
                  <li>View prerequisite GPA requirements at a glance</li>
                  <li>Grade point values for all grading scales</li>
                </ul>
              </div>
            </div>

            {/* Scenario Planning */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <Lightbulb size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>What-If Scenario Planning</h2>
                <p className={styles.featureDescription}>
                  Ever wondered "what if I retook that class?" Now you can find out! Create unlimited 
                  scenarios to simulate course retakes, hypothetical courses, and see exactly how 
                  they'd impact your GPA and program eligibility—before you commit.
                </p>
                <ul className={styles.featureBullets}>
                  <li>Simulate course retakes with different grades</li>
                  <li>Add hypothetical courses to predict GPA changes</li>
                  <li>Compare multiple scenarios side-by-side</li>
                  <li>Make data-driven decisions about your course load</li>
                </ul>
              </div>
            </div>

            {/* Program Requirements Tracking */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <Target size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>Program Requirements Tracker</h2>
                <p className={styles.featureDescription}>
                  Stop digging through PDF catalogs and confusing websites. See all your program 
                  requirements in one clean, organized view. Match your completed courses to requirements 
                  and track your progress toward graduation or program admission.
                </p>
                <ul className={styles.featureBullets}>
                  <li>Visual progress bars showing completion percentage</li>
                  <li>Automatic course matching with smart suggestions</li>
                  <li>Clear prerequisite chains and dependencies</li>
                  <li>Minimum grade requirements highlighted</li>
                </ul>
              </div>
            </div>

            {/* Eligibility Checker */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <CheckCircle size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>Instant Eligibility Checker</h2>
                <p className={styles.featureDescription}>
                  Discover which programs you qualify for right now. Our intelligent system compares 
                  your academic record against thousands of program requirements and shows you exactly 
                  where you stand—and what's missing if you're not quite there yet.
                </p>
                <ul className={styles.featureBullets}>
                  <li>See all eligible programs at a glance</li>
                  <li>Know exactly which requirements you're missing</li>
                  <li>Get personalized recommendations to improve eligibility</li>
                  <li>Filter programs by institution, field, and more</li>
                </ul>
              </div>
            </div>

            {/* Course Management */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <BookOpen size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>Complete Course Management</h2>
                <p className={styles.featureDescription}>
                  Keep all your academic records organized in one place. Upload transcripts, add 
                  courses manually, track terms and semesters, and maintain a complete history of 
                  your academic journey across multiple institutions.
                </p>
                <ul className={styles.featureBullets}>
                  <li>Easy transcript upload and parsing</li>
                  <li>Organize courses by term and institution</li>
                  <li>Track credits, grades, and course details</li>
                  <li>Transfer credit management made simple</li>
                </ul>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <TrendingUp size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>Visual Progress Tracking</h2>
                <p className={styles.featureDescription}>
                  Watch your academic goals come to life with beautiful, intuitive progress 
                  visualizations. See completion percentages, GPA trends, and requirement fulfillment 
                  at a glance—motivation has never looked this good.
                </p>
                <ul className={styles.featureBullets}>
                  <li>Real-time completion percentage tracking</li>
                  <li>GPA trends and projections over time</li>
                  <li>Color-coded requirement status</li>
                  <li>Celebrate milestones as you achieve them</li>
                </ul>
              </div>
            </div>

            {/* Multi-Institution Support */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <Users size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>Multi-Institution Support</h2>
                <p className={styles.featureDescription}>
                  Whether you're at community college, transferring to a university, or taking courses 
                  across multiple schools, PrereqPilot handles it all. Track courses from any institution 
                  and see how they apply to your target programs.
                </p>
                <ul className={styles.featureBullets}>
                  <li>Add courses from unlimited institutions</li>
                  <li>View transfer credit articulations</li>
                  <li>Compare programs across different schools</li>
                  <li>Plan complex transfer pathways</li>
                </ul>
              </div>
            </div>

            {/* Time-Saving Automation */}
            <div className={styles.featureBlock}>
              <div className={styles.featureIcon}>
                <Clock size={48} strokeWidth={2} />
              </div>
              <div className={styles.featureContent}>
                <h2 className={styles.featureTitle}>Save Hours Every Week</h2>
                <p className={styles.featureDescription}>
                  Stop manually cross-referencing program requirements, recalculating GPAs, and 
                  tracking prerequisites. PrereqPilot automates the tedious work so you can focus 
                  on what matters—achieving your academic goals.
                </p>
                <ul className={styles.featureBullets}>
                  <li>Automatic GPA calculations (no spreadsheets!)</li>
                  <li>Smart course matching with requirements</li>
                  <li>Instant eligibility checks</li>
                  <li>One-click scenario comparisons</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContent}>
          <h2 className={styles.statsTitle}>Join Students Planning Smarter</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10+</div>
              <div className={styles.statLabel}>Hours Saved Per Student</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Free for Students</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>∞</div>
              <div className={styles.statLabel}>Unlimited Scenarios</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Take Control of Your Academic Future?</h2>
          <p className={styles.ctaDescription}>
            Join students who are already planning smarter with PrereqPilot. 
            Create your free account and start tracking your progress today.
          </p>
          <div className={styles.ctaButtons}>
            {user ? (
              <Link href="/dashboard" className={styles.ctaPrimaryButton}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className={styles.ctaPrimaryButton}>
                  Get Started Free
                </Link>
                <Link href="/about" className={styles.ctaSecondaryButton}>
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
