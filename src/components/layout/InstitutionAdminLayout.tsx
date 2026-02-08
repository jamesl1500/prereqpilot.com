'use client';

import InstitutionHeader from '@/components/shared/InstitutionHeader';
import { InstitutionFooter } from '@/components/InstitutionFooter';
import AuthenticatedProviders from '@/components/shared/AuthenticatedProviders';

interface InstitutionAdminLayoutProps {
  children: React.ReactNode;
}

export default function InstitutionAdminLayout({ children }: InstitutionAdminLayoutProps) {
  return (
    <AuthenticatedProviders>
      <InstitutionHeader />
      <div className="website-layout-no-sidebar">
        {/* Main Content */}
        <main className="website-main-full">{children}</main>
      </div>
      <InstitutionFooter />
    </AuthenticatedProviders>
  );
}
