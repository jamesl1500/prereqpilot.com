import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StaffPage } from './StaffPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Management - PrereqPilot',
  description: 'Manage institution staff members',
};

export default async function Page() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check user's institution role - only admins can manage staff
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role, institution_id, institutions(*)')
    .eq('user_id', user.id)
    .eq('role', 'institution_admin')
    .single();

  if (!userRole) {
    redirect('/institution/dashboard');
  }

  const institution = userRole.institutions as any;

  // If not verified yet, redirect to pending page
  if (institution.status !== 'verified') {
    redirect('/institution/pending');
  }

  // Get all staff members for this institution
  const { data: staffMembers } = await supabase
    .from('user_roles')
    .select(`
      id,
      user_id,
      role,
      created_at
    `)
    .eq('institution_id', institution.id)
    .order('created_at', { ascending: false });

  // Get user details for each staff member
  const staffWithUsers = await Promise.all(
    (staffMembers || []).map(async (staff) => {
      const { data: userData } = await supabase.auth.admin.getUserById(staff.user_id);
      return {
        ...staff,
        users: {
          id: userData?.user?.id || '',
          email: userData?.user?.email || '',
          user_metadata: userData?.user?.user_metadata || {},
        },
      };
    })
  );

  return <StaffPage institution={institution} staffMembers={staffWithUsers} />;
}
