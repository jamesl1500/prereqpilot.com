import Link from 'next/link';
import styles from '@/styles/modules/pages/contact.module.scss';
import type { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Contact Us - PrereqPilot',
  description: 'Get in touch with PrereqPilot. We\'re here to help students and institutions with questions, support, and partnerships.',
};

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <PublicHeader />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            We're here to help. Choose the option that best fits your needs.
          </p>
        </div>
      </header>

      {/* Contact Options */}
      <section className={styles.contactOptions}>
        <div className={styles.sectionContent}>
          <div className={styles.optionsGrid}>
            {/* Students */}
            <div className={styles.optionCard}>
              <div className={styles.optionIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
              <h2 className={styles.optionTitle}>For Students</h2>
              <p className={styles.optionDescription}>
                Questions about using PrereqPilot, finding programs, or checking eligibility?
              </p>
              <div className={styles.contactMethods}>
                <div className={styles.contactMethod}>
                  <strong>General Support</strong>
                  <a href="mailto:support@prereqpilot.com">support@prereqpilot.com</a>
                </div>
                <div className={styles.contactMethod}>
                  <strong>Technical Issues</strong>
                  <a href="mailto:help@prereqpilot.com">help@prereqpilot.com</a>
                </div>
              </div>
              <Link href="/help" className={styles.optionLink}>
                Visit Help Center →
              </Link>
            </div>

            {/* Institutions */}
            <div className={styles.optionCard}>
              <div className={styles.optionIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h2 className={styles.optionTitle}>For Institutions</h2>
              <p className={styles.optionDescription}>
                Interested in partnering, registering your institution, or managing your programs?
              </p>
              <div className={styles.contactMethods}>
                <div className={styles.contactMethod}>
                  <strong>Partnerships</strong>
                  <a href="mailto:institutions@prereqpilot.com">institutions@prereqpilot.com</a>
                </div>
                <div className={styles.contactMethod}>
                  <strong>Technical Support</strong>
                  <a href="mailto:support@prereqpilot.com">support@prereqpilot.com</a>
                </div>
              </div>
              <Link href="/institution/signup" className={styles.optionLink}>
                Register Institution →
              </Link>
            </div>

            {/* General Inquiries */}
            <div className={styles.optionCard}>
              <div className={styles.optionIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className={styles.optionTitle}>General Inquiries</h2>
              <p className={styles.optionDescription}>
                Media requests, business inquiries, or other questions?
              </p>
              <div className={styles.contactMethods}>
                <div className={styles.contactMethod}>
                  <strong>General</strong>
                  <a href="mailto:info@prereqpilot.com">info@prereqpilot.com</a>
                </div>
                <div className={styles.contactMethod}>
                  <strong>Press & Media</strong>
                  <a href="mailto:press@prereqpilot.com">press@prereqpilot.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className={styles.formSection}>
        <div className={styles.formContent}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Send Us a Message</h2>
            <p className={styles.formDescription}>
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          <form className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="inquiry-type" className={styles.label}>
                Inquiry Type *
              </label>
              <select
                id="inquiry-type"
                name="inquiryType"
                className={styles.select}
                required
              >
                <option value="">Select an option</option>
                <option value="student-support">Student Support</option>
                <option value="institution-partnership">Institution Partnership</option>
                <option value="technical-issue">Technical Issue</option>
                <option value="feature-request">Feature Request</option>
                <option value="press-media">Press & Media</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject" className={styles.label}>
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                className={styles.textarea}
                rows={8}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              SEND MESSAGE
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How quickly will I get a response?</h3>
              <p className={styles.faqAnswer}>
                We aim to respond to all inquiries within 24 hours during business days. 
                Urgent technical issues are prioritized.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I schedule a demo for my institution?</h3>
              <p className={styles.faqAnswer}>
                Yes! Email us at{' '}
                <a href="mailto:institutions@prereqpilot.com">institutions@prereqpilot.com</a>{' '}
                to schedule a personalized demo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Where can I find help documentation?</h3>
              <p className={styles.faqAnswer}>
                Visit our <Link href="/help">Help Center</Link> for comprehensive guides, 
                FAQs, and tutorials.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Do you offer phone support?</h3>
              <p className={styles.faqAnswer}>
                Currently, we provide support via email for the best documentation and 
                response quality. We're exploring phone support for institutional partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
