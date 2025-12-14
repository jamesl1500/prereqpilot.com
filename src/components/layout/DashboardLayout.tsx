'use client';

import type { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Sidebar from '@/components/shared/Sidebar';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {

  return (
    <>
      <Header />
      <div className="website-layout">
        {/* Sidebar */}
        <div className='sidebar-container'>
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="website-main">{children}</main>
      </div>
    </>
  );
}
