import Link from 'next/link';
import styles from '@/styles/modules/pages/about.module.scss';
import type { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'About Us - PrereqPilot',
  description: 'Learn about PrereqPilot\'s mission to simplify academic planning and help students achieve their educational goals.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>About PrereqPilot</h1>
          <p className={styles.subtitle}>
            Making academic planning accessible, transparent, and stress-free for every student
          </p>
        </div>
      </header>

      {/* Mission Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <div className={styles.missionContent}>
            <p className={styles.largeText}>
              We believe every student deserves clear, accessible information about their academic path. 
              PrereqPilot was built to eliminate confusion around program requirements, prerequisites, 
              and eligibility—empowering students to make informed decisions about their future.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>The Problem We're Solving</h2>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <h3>Fragmented Information</h3>
              <p>
                Students waste countless hours navigating multiple websites, catalogs, and departments 
                to understand program requirements.
              </p>
            </div>
            <div className={styles.problemCard}>
              <h3>Unclear Eligibility</h3>
              <p>
                It's often impossible to know if you qualify for a program without speaking to an 
                advisor or manually checking every requirement.
              </p>
            </div>
            <div className={styles.problemCard}>
              <h3>Complex Prerequisites</h3>
              <p>
                Understanding prerequisite chains and planning the right sequence of courses is 
                unnecessarily complicated.
              </p>
            </div>
            <div className={styles.problemCard}>
              <h3>Limited Visibility</h3>
              <p>
                Students can't easily compare programs across institutions or understand transfer 
                credit requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className={styles.solutionSection}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Our Solution</h2>
          <div className={styles.solutionContent}>
            <div className={styles.solutionItem}>
              <div className={styles.solutionNumber}>01</div>
              <div className={styles.solutionText}>
                <h3>Centralized Information</h3>
                <p>
                  All program requirements, courses, and prerequisites in one searchable platform.
                </p>
              </div>
            </div>
            <div className={styles.solutionItem}>
              <div className={styles.solutionNumber}>02</div>
              <div className={styles.solutionText}>
                <h3>Instant Eligibility Checks</h3>
                <p>
                  See which programs you qualify for based on your completed courses and GPA.
                </p>
              </div>
            </div>
            <div className={styles.solutionItem}>
              <div className={styles.solutionNumber}>03</div>
              <div className={styles.solutionText}>
                <h3>Smart Planning Tools</h3>
                <p>
                  Create personalized academic roadmaps with automated prerequisite tracking.
                </p>
              </div>
            </div>
            <div className={styles.solutionItem}>
              <div className={styles.solutionNumber}>04</div>
              <div className={styles.solutionText}>
                <h3>Multi-Institution Support</h3>
                <p>
                  Compare programs across institutions and understand transfer requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3>Transparency</h3>
              <p>
                Clear, accurate information without hidden barriers or confusing policies.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3>Accessibility</h3>
              <p>
                Academic planning tools should be available to every student, regardless of background.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3>Empowerment</h3>
              <p>
                We give students the tools and knowledge to take control of their academic journey.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3>Innovation</h3>
              <p>
                Continuously improving our platform with feedback from students and institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Built by Students, For Students</h2>
          <p className={styles.teamDescription}>
            PrereqPilot was created by students who experienced firsthand the frustration of navigating 
            complex academic requirements. We're committed to making academic planning simpler, more 
            transparent, and accessible to everyone.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Start Planning?</h2>
          <p className={styles.ctaSubtitle}>
            Join PrereqPilot today and take control of your academic journey.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/signup" className={styles.primaryButton}>
              Get Started Free
            </Link>
            <Link href="/help" className={styles.secondaryButton}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
