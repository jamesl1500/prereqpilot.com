import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstitutionAdminLayout from '@/components/layout/InstitutionAdminLayout';

export default async function InstitutionAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user has institution_admin role
  const userRole = user.user_metadata?.role;
  if (userRole !== 'institution_admin') {
    redirect('/dashboard');
  }

  return <InstitutionAdminLayout>{children}</InstitutionAdminLayout>;
}
