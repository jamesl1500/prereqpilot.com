import type { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import { AuthFooter } from '@/components/AuthFooter';
import AuthenticatedProviders from '@/components/shared/AuthenticatedProviders';

interface DashboardLayoutProps {
  user?: User;
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthenticatedProviders>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1, paddingTop: '70px' }}>{children}</main>
        <AuthFooter />
      </div>
    </AuthenticatedProviders>
  );
}
