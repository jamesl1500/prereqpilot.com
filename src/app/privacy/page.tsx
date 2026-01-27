
import styles from '@/styles/modules/pages/legal.module.scss';
import type { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy - PrereqPilot',
  description: 'PrereqPilot Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Last updated: December 12, 2024
          </p>
        </div>
      </header>

      {/* Content */}
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            Welcome to PrereqPilot ("we," "our," or "us"). We respect your privacy and are committed 
            to protecting your personal data. This privacy policy explains how we collect, use, and 
            safeguard your information when you use our platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li>Account information (name, email address, password)</li>
            <li>Academic information (completed courses, GPA, institution)</li>
            <li>Profile information (program interests, academic goals)</li>
            <li>Communication preferences</li>
          </ul>

          <h3>2.2 Information We Collect Automatically</h3>
          <ul>
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Device information (browser type, operating system, IP address)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Check your eligibility for academic programs</li>
            <li>Create personalized academic plans</li>
            <li>Communicate with you about your account and our services</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with:
          </p>
          <ul>
            <li>
              <strong>Institutions:</strong> When you apply to programs, we share relevant academic 
              information with the institution (with your consent)
            </li>
            <li>
              <strong>Service Providers:</strong> Third-party services that help us operate our platform 
              (e.g., hosting, analytics, email services)
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. This includes:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure data storage practices</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@prereqpilot.com">privacy@prereqpilot.com</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to improve your experience, analyze usage, and 
            provide personalized features. You can control cookie settings through your browser, but 
            disabling cookies may affect platform functionality.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Third-Party Services</h2>
          <p>
            Our platform may contain links to third-party websites or services. We are not responsible 
            for the privacy practices of these external sites. We encourage you to review their privacy 
            policies.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Children's Privacy</h2>
          <p>
            PrereqPilot is intended for users aged 13 and older. We do not knowingly collect personal 
            information from children under 13. If we discover such data, we will delete it promptly.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and 
            comply with legal obligations. When you delete your account, we will remove or anonymize 
            your data within 30 days, unless retention is required by law.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data in accordance with 
            this privacy policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of significant 
            changes by email or through a notice on our platform. Continued use of PrereqPilot after 
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Contact Us</h2>
          <p>
            If you have questions or concerns about this privacy policy or our data practices, 
            please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:privacy@prereqpilot.com">privacy@prereqpilot.com</a></li>
            <li>Support: <a href="mailto:support@prereqpilot.com">support@prereqpilot.com</a></li>
          </ul>
        </section>
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
