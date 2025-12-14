import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InstitutionPendingPage } from './InstitutionPendingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verification Pending - PrereqPilot',
  description: 'Your institution registration is pending verification',
};

export default async function PendingPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check user's institution role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role, institution_id, institutions(*)')
    .eq('user_id', user.id)
    .eq('role', 'institution_admin')
    .single();

  if (!userRole) {
    redirect('/institution/signup');
  }

  const institution = userRole.institutions as any;

  // If already verified, redirect to dashboard
  if (institution.status === 'verified') {
    redirect('/institution/dashboard');
  }

  // If suspended, show different message
  if (institution.status === 'suspended') {
    redirect('/institution/suspended');
  }

  return <InstitutionPendingPage institution={institution} user={user} />;
}
