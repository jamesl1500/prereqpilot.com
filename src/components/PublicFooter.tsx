import Link from 'next/link';
import styles from '@/styles/modules/components/public-footer.module.scss';

export function PublicFooter() {
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
          <h4 className={styles.footerHeading}>Product</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/programs">Programs</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/help">Help Center</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>For Institutions</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/institutions">Learn More</Link></li>
            <li><Link href="/institution/signup">Register Institution</Link></li>
            <li><Link href="/institution/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Support</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; 2024 PrereqPilot. All rights reserved.</p>
      </div>
    </footer>
  );
}
