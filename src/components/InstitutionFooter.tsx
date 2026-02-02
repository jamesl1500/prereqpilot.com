import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/modules/components/institution-footer.module.scss';
import { APP_VERSION, APP_VERSION_STATUS } from '@/lib/config';

export function InstitutionFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.footerBrand}>
            <Image
              src="/primary_logo.png"
              alt="PrereqPilot Logo"
              width={40}
              height={40}
              className={styles.footerLogo}
            />
            <div className={styles.footerBrandText}>
              <h3 className={styles.footerTitle}>PrereqPilot</h3>
              <p className={styles.footerVersion}>{APP_VERSION_STATUS} ({APP_VERSION})</p>
            </div>
          </div>
          <p className={styles.footerDescription}>
            Institution Management Portal
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Management</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/institution/dashboard">Dashboard</Link></li>
            <li><Link href="/institution/programs">Programs</Link></li>
            <li><Link href="/institution/courses">Courses</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Administration</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/institution/staff">Staff</Link></li>
            <li><Link href="/institution/profile">Profile</Link></li>
            <li><Link href="/institution/settings">Settings</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Support</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/help">Help Center</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/institution/documentation">Documentation</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; 2026 PrereqPilot {APP_VERSION_STATUS} ({APP_VERSION}). All rights reserved.</p>
      </div>
    </footer>
  );
}
