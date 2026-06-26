import styles from '@/styles/modules/pages/help.module.scss';
import type { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Help Center — How to Plan Your Grad School Path',
  description:
    'Get answers to common questions about using PrereqPilot to check grad school eligibility, track prerequisites, calculate GPA requirements, and plan your academic journey.',
  alternates: { canonical: 'https://www.prereqpilot.com/help' },
};

export default function HelpPage() {
  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Help Center</h1>
          <p className={styles.subtitle}>
            Find answers to common questions and learn how to make the most of PrereqPilot
          </p>
        </div>
      </header>

      {/* Quick Links */}
      <section className={styles.quickLinks}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Quick Help</h2>
          <div className={styles.linkGrid}>
            <a href="#getting-started" className={styles.linkCard}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>Getting Started</span>
            </a>
            <a href="#programs" className={styles.linkCard}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Finding Programs</span>
            </a>
            <a href="#eligibility" className={styles.linkCard}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>Checking Eligibility</span>
            </a>
            <a href="#planning" className={styles.linkCard}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Planning Your Path</span>
            </a>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Getting Started</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do I create an account?</h3>
              <p className={styles.faqAnswer}>
                Click "Get Started Free" on the homepage, then enter your email and create a password. 
                Once verified, you can start exploring programs and building your academic plan.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Is PrereqPilot free to use?</h3>
              <p className={styles.faqAnswer}>
                Yes! PrereqPilot is completely free for students. We believe every student should have 
                access to clear academic planning tools.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What information do I need to get started?</h3>
              <p className={styles.faqAnswer}>
                To get the most out of PrereqPilot, have a list of your completed courses and your 
                current GPA ready. This helps us show you accurate eligibility for programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Finding Programs */}
      <section id="programs" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Finding Programs</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do I search for programs?</h3>
              <p className={styles.faqAnswer}>
                Navigate to the Programs page to browse all available programs. You can filter by 
                institution, program type, field of study, and more. The search updates in real-time 
                as you add filters.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I see programs from multiple institutions?</h3>
              <p className={styles.faqAnswer}>
                Yes! PrereqPilot shows programs from all institutions registered on our platform. 
                You can easily compare requirements across different schools.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What if my institution isn't listed?</h3>
              <p className={styles.faqAnswer}>
                We're constantly adding new institutions. If your school isn't listed, you can 
                contact us at support@prereqpilot.com or ask your institution to register on our 
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checking Eligibility */}
      <section id="eligibility" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Checking Eligibility</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How does eligibility checking work?</h3>
              <p className={styles.faqAnswer}>
                When you add your completed courses and GPA to your profile, PrereqPilot automatically 
                compares them against program requirements. You'll see your completion percentage and 
                which requirements you've met.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What if I have transfer credits?</h3>
              <p className={styles.faqAnswer}>
                You can add transfer courses to your profile. PrereqPilot will check for course 
                equivalencies between institutions to accurately calculate your eligibility.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Is the eligibility calculation accurate?</h3>
              <p className={styles.faqAnswer}>
                We work directly with institutions to ensure program requirements are accurate and 
                up-to-date. However, always verify with an academic advisor before making final 
                decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planning Your Path */}
      <section id="planning" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Planning Your Path</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do I create an academic plan?</h3>
              <p className={styles.faqAnswer}>
                Once you've found a program you're interested in, click "Create Plan" to build a 
                personalized roadmap. You'll see all required courses, prerequisites, and suggested 
                timelines.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I track multiple programs?</h3>
              <p className={styles.faqAnswer}>
                Yes! You can create plans for multiple programs and compare them side-by-side. This 
                helps you explore different paths and make informed decisions.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do I update my progress?</h3>
              <p className={styles.faqAnswer}>
                As you complete courses, mark them as completed in your profile. Your eligibility 
                percentages and academic plans will update automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact}>
        <div className={styles.contactContent}>
          <h2 className={styles.contactTitle}>Still Have Questions?</h2>
          <p className={styles.contactDescription}>
            Our support team is here to help you navigate PrereqPilot and plan your academic journey.
          </p>
          <div className={styles.contactMethods}>
            <div className={styles.contactMethod}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <h3>Email Support</h3>
                <a href="mailto:support@prereqpilot.com">support@prereqpilot.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
