import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/modules/components/public-footer.module.scss';
import { APP_VERSION_STATUS, APP_VERSION } from '@/lib/config';

export default function PublicFooter() {
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
            Your academic planning companion
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerHeading}>Product</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/help">Help Center</Link></li>
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
        <p>&copy; 2026 PrereqPilot {APP_VERSION_STATUS} ({APP_VERSION}). All rights reserved.</p>
      </div>
    </footer>
  );
}
