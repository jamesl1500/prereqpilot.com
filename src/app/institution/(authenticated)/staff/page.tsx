import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
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

  // Get user details for each staff member using service role client
  // (needed to access auth.users table with email)
  const userIds = staffMembers?.map(s => s.user_id) || [];
  
  let usersMap: Record<string, any> = {};
  if (userIds.length > 0) {
    try {
      const serviceRoleClient = createServiceRoleClient();
      const { data: authUsers, error: authError } = await serviceRoleClient
        .from('auth.users')
        .select('id, email, raw_user_meta_data')
        .in('id', userIds);

      if (authError) {
        console.error('Error fetching auth users:', authError);
      } else {
        console.log('Auth Users fetched:', authUsers?.length, 'records');
        
        if (authUsers && Array.isArray(authUsers)) {
          usersMap = authUsers.reduce((acc, user: any) => ({
            ...acc,
            [user.id]: {
              id: user.id,
              email: user.email,
              user_metadata: user.raw_user_meta_data || {},
            },
          }), {});
        }
      }
    } catch (error) {
      console.error('Exception fetching auth users:', error);
    }
  }

  const staffWithUsers = (staffMembers || []).map((staff) => ({
    ...staff,
    users: usersMap[staff.user_id] || {
      id: staff.user_id,
      email: '',
      user_metadata: {},
    },
  }));

  return <StaffPage institution={institution} staffMembers={staffWithUsers} />;
}
