import Link from 'next/link';
import styles from '@/styles/modules/pages/legal.module.scss';
import type { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Terms of Service - PrereqPilot',
  description: 'PrereqPilot Terms of Service - Review the terms and conditions for using our platform.',
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>
            Last updated: December 12, 2024
          </p>
        </div>
      </header>

      {/* Content */}
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using PrereqPilot ("the Platform"), you agree to be bound by these Terms 
            of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Description of Service</h2>
          <p>
            PrereqPilot is an academic planning platform that helps students discover programs, check 
            eligibility, and plan their educational path. We provide:
          </p>
          <ul>
            <li>Program and course information from participating institutions</li>
            <li>Eligibility checking based on academic prerequisites</li>
            <li>Academic planning and tracking tools</li>
            <li>Application support for institutional programs</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. User Accounts</h2>
          <h3>3.1 Account Creation</h3>
          <p>
            You must create an account to use certain features of the Platform. You are responsible 
            for maintaining the confidentiality of your account credentials and for all activities 
            under your account.
          </p>

          <h3>3.2 Account Requirements</h3>
          <ul>
            <li>You must be at least 13 years old to create an account</li>
            <li>You must provide accurate and complete information</li>
            <li>You may not use another person's account without permission</li>
            <li>You must notify us immediately of any unauthorized access</li>
          </ul>

          <h3>3.3 Account Termination</h3>
          <p>
            We reserve the right to suspend or terminate your account if you violate these Terms or 
            engage in fraudulent or harmful activities.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate academic information</li>
            <li>Use the Platform for lawful purposes only</li>
            <li>Not attempt to gain unauthorized access to any part of the Platform</li>
            <li>Not interfere with or disrupt the Platform's functionality</li>
            <li>Not use automated systems to access the Platform without permission</li>
            <li>Respect the intellectual property rights of PrereqPilot and others</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Academic Information</h2>
          <h3>5.1 Accuracy and Verification</h3>
          <p>
            While we strive to provide accurate program and course information, we rely on data from 
            participating institutions. You should always verify critical information with the institution 
            directly before making academic or financial decisions.
          </p>

          <h3>5.2 Eligibility Calculations</h3>
          <p>
            Our eligibility calculations are based on the information you provide and institutional 
            requirements. These are estimates and do not guarantee admission to any program. Final 
            admission decisions are made by the institutions.
          </p>

          <h3>5.3 No Guarantee</h3>
          <p>
            PrereqPilot does not guarantee admission to any institution or program, nor do we guarantee 
            the accuracy of any specific piece of information on the Platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Intellectual Property</h2>
          <h3>6.1 Platform Content</h3>
          <p>
            All content, features, and functionality on PrereqPilot (including text, graphics, logos, 
            and software) are owned by PrereqPilot and are protected by copyright, trademark, and 
            other intellectual property laws.
          </p>

          <h3>6.2 User License</h3>
          <p>
            We grant you a limited, non-exclusive, non-transferable license to access and use the 
            Platform for personal, non-commercial purposes in accordance with these Terms.
          </p>

          <h3>6.3 User Content</h3>
          <p>
            You retain ownership of any content you submit to the Platform. By submitting content, 
            you grant us a worldwide, royalty-free license to use, store, and display that content 
            as necessary to provide our services.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Privacy</h2>
          <p>
            Your use of the Platform is subject to our{' '}
            <Link href="/privacy">Privacy Policy</Link>, which explains how we collect, use, and 
            protect your personal information.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Third-Party Services</h2>
          <p>
            The Platform may integrate with or contain links to third-party services. We are not 
            responsible for the content, policies, or practices of third-party services. Your use 
            of third-party services is at your own risk.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Disclaimers</h2>
          <p>
            THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
            EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL 
            WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
            NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Platform will be uninterrupted, secure, or error-free, or 
            that defects will be corrected.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, PREREQPILOT SHALL NOT BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR 
            REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
            OR OTHER INTANGIBLE LOSSES.
          </p>
          <p>
            IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE 
            MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless PrereqPilot, its affiliates, and their respective 
            officers, directors, employees, and agents from any claims, damages, losses, liabilities, 
            and expenses (including legal fees) arising from your use of the Platform or violation of 
            these Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Modifications to Service and Terms</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Platform at any 
            time. We may also update these Terms periodically. Continued use of the Platform after 
            changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the 
            jurisdiction in which PrereqPilot operates, without regard to conflict of law principles.
          </p>
        </section>

        <section className={styles.section}>
          <h2>14. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or your use of the Platform shall be resolved 
            through binding arbitration in accordance with the rules of the American Arbitration 
            Association, except where prohibited by law.
          </p>
        </section>

        <section className={styles.section}>
          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining 
            provisions shall continue in full force and effect.
          </p>
        </section>

        <section className={styles.section}>
          <h2>16. Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:legal@prereqpilot.com">legal@prereqpilot.com</a></li>
            <li>Support: <a href="mailto:support@prereqpilot.com">support@prereqpilot.com</a></li>
          </ul>
        </section>
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
