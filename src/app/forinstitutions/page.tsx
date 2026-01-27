import Link from 'next/link';
import styles from '@/styles/modules/pages/for-institutions.module.scss';
import type { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'For Institutions - PrereqPilot',
  description: 'Partner with PrereqPilot to streamline admissions, reach qualified students, and showcase your programs.',
};

export default function ForInstitutionsPage() {
  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Reach Qualified Students.<br />
            Streamline Admissions.
          </h1>
          <p className={styles.heroSubtitle}>
            Partner with PrereqPilot to connect with students who are already qualified for your programs.
          </p>
          <div className={styles.heroCta}>
            <Link href="/institution/signup" className={styles.primaryButton}>
              Register Your Institution
            </Link>
            <a href="#benefits" className={styles.secondaryButton}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsContent}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>10,000+</div>
            <div className={styles.statLabel}>Active Students</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>50+</div>
            <div className={styles.statLabel}>Partner Institutions</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>85%</div>
            <div className={styles.statLabel}>Application Completion</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>24/7</div>
            <div className={styles.statLabel}>Platform Access</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={styles.benefits}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Why Partner with PrereqPilot?</h2>
          <div className={styles.benefitGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className={styles.benefitTitle}>Reach Qualified Students</h3>
              <p className={styles.benefitDescription}>
                Students discover your programs when they're already eligible, increasing application 
                quality and completion rates.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className={styles.benefitTitle}>Streamline Admissions</h3>
              <p className={styles.benefitDescription}>
                Reduce administrative overhead with pre-qualified applicants who understand your 
                requirements upfront.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className={styles.benefitTitle}>Save Time & Resources</h3>
              <p className={styles.benefitDescription}>
                Automated eligibility checking means fewer unqualified applications and more efficient 
                review processes.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className={styles.benefitTitle}>Increase Enrollment</h3>
              <p className={styles.benefitDescription}>
                Showcase your programs to students actively searching for their next academic step.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18 17l-3-3-4 4-5-5" />
                </svg>
              </div>
              <h3 className={styles.benefitTitle}>Data & Analytics</h3>
              <p className={styles.benefitDescription}>
                Track application trends, student interest, and optimize your program offerings with 
                real-time insights.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className={styles.benefitTitle}>Maintain Control</h3>
              <p className={styles.benefitDescription}>
                You manage your program details, requirements, and application process—we just connect 
                you with the right students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Partner with PrereqPilot?</h2>
          <p className={styles.ctaSubtitle}>
            Join leading institutions already using PrereqPilot to streamline admissions and reach 
            qualified students.
          </p>
          <Link href="/institution/signup" className={styles.ctaButton}>
            Register Your Institution
          </Link>
          <p className={styles.ctaNote}>
            Have questions? <Link href="/contact">Contact our team</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
