'use client';

import type { User } from '@supabase/supabase-js';
import InstitutionHeader from '@/components/shared/InstitutionHeader';

interface InstitutionAdminLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function InstitutionAdminLayout({ children, user }: InstitutionAdminLayoutProps) {
  return (
    <>
      <InstitutionHeader user={user} />
      <div className="website-layout-no-sidebar">
        {/* Main Content */}
        <main className="website-main-full">{children}</main>
      </div>
    </>
  );
}
