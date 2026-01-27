import Link from 'next/link';
import styles from '@/styles/modules/components/auth-footer.module.scss';

export function AuthFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>PrereqPilot</h3>
          <p className={styles.footerDescription}>
            Your academic planning companion
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Dashboard</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/dashboard">Overview</Link></li>
            <li><Link href="/plans">Academic Plans</Link></li>
            <li><Link href="/programs">Programs</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Resources</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/classes">My Classes</Link></li>
            <li><Link href="/transcript">Transcript</Link></li>
            <li><Link href="/scenarios">What-If Scenarios</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Support</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/help">Help Center</Link></li>
            <li><Link href="/settings">Account Settings</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; 2026 PrereqPilot. All rights reserved.</p>
      </div>
    </footer>
  );
}
