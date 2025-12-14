import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstitutionSignupPage from './InstitutionSignupPage';

export const metadata = {
  title: 'Institution Signup - PrereqPilot',
  description: 'Register your institution to manage programs and course catalogs',
};

export default async function InstitutionSignup() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If already logged in, check if they have institution admin role
  if (user) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role, institution_id')
      .eq('user_id', user.id)
      .eq('role', 'institution_admin')
      .single();

    if (roles) {
      // Already an institution admin, redirect to dashboard
      redirect('/institution/dashboard');
    }
  }

  return <InstitutionSignupPage />;
}
