import Link from 'next/link';
import styles from '@/styles/modules/pages/home.module.scss';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Plan Your Path to Grad School & College Programs — Free Tool for Students',
  description:
    'PrereqPilot helps college students check graduate school eligibility, track prerequisite courses, and build a personalized roadmap to their dream program. Free to use.',
  alternates: { canonical: 'https://www.prereqpilot.com' },
  openGraph: {
    title: 'Plan Your Path to Grad School — PrereqPilot',
    description:
      'Check grad school eligibility, track prerequisite requirements, and map out every course you need. Built for college students planning their next chapter.',
    url: 'https://www.prereqpilot.com',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.prereqpilot.com/#website',
      url: 'https://www.prereqpilot.com',
      name: 'PrereqPilot',
      description:
        'Free academic planning tool that helps college students check graduate school eligibility, track prerequisite courses, and build a personalized path to their dream program.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.prereqpilot.com/browse-programs?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.prereqpilot.com/#organization',
      name: 'PrereqPilot',
      url: 'https://www.prereqpilot.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.prereqpilot.com/primary_logo.png',
      },
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@prereqpilot.com',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.prereqpilot.com/#app',
      name: 'PrereqPilot',
      url: 'https://www.prereqpilot.com',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'PrereqPilot is a free academic planning platform for college students. Check grad school GPA and prerequisite requirements, build a course roadmap, simulate academic scenarios, and discover programs you qualify for.',
      featureList: [
        'Graduate school eligibility checker',
        'Prerequisite course tracker',
        'GPA calculator and projector',
        'Academic roadmap builder',
        'Scenario simulator for what-if planning',
        'Multi-institution program browser',
      ],
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'student',
      },
    },
  ],
};

export default async function Home() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <PublicHeader user={user} />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Plan Your Academic Journey.<br />
            Find Programs You Qualify For.
          </h1>
          <p className={styles.heroSubtitle}>
            PrereqPilot helps students discover eligible programs, plan their course path, 
            and navigate academic requirements with confidence.
          </p>
          <div className={styles.heroCta}>
            {user ? (
              <Link href="/programs" className={styles.primaryButton}>
                Explore Programs
              </Link>
            ) : (
              <>
                <Link href="/signup" className={styles.primaryButton}>
                  Get Started Free
                </Link>
                <Link href="/login" className={styles.secondaryButton}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Students Choose PrereqPilot</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to plan your academic future in one place
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Check Eligibility</h3>
            <p className={styles.featureDescription}>
              Instantly see which programs you qualify for based on your completed courses and GPA.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Plan Your Path</h3>
            <p className={styles.featureDescription}>
              Create custom academic plans with required courses, prerequisites, and timelines.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Track Progress</h3>
            <p className={styles.featureDescription}>
              Monitor your completion percentage and see exactly what's left to achieve your goals.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Multiple Institutions</h3>
            <p className={styles.featureDescription}>
              Explore programs from different institutions and understand transfer requirements.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How PrereqPilot Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Create Your Profile</h3>
              <p className={styles.stepDescription}>
                Sign up and add your completed courses, current GPA, and academic interests.
              </p>
            </div>
          </div>

          <div className={styles.stepDivider}>→</div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Discover Programs</h3>
              <p className={styles.stepDescription}>
                Browse programs from top institutions and see your eligibility in real-time.
              </p>
            </div>
          </div>

          <div className={styles.stepDivider}>→</div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Plan Your Journey</h3>
              <p className={styles.stepDescription}>
                Create your personalized academic roadmap with required courses and deadlines.
              </p>
            </div>
          </div>

          <div className={styles.stepDivider}>→</div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Achieve Your Goals</h3>
              <p className={styles.stepDescription}>
                Track your progress and complete your program requirements with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Plan Your Future?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of students already using PrereqPilot to navigate their academic journey.
          </p>
          {!user && (
            <Link href="/signup" className={styles.ctaButton}>
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
    </>
  );
}
