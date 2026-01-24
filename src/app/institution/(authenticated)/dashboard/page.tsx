import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InstitutionDashboard } from './InstitutionDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Institution Dashboard - PrereqPilot',
  description: 'Manage your institution, courses, and programs',
};

export default async function DashboardPage() {
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
    .or('role.eq.institution_admin,role.eq.institution_staff')
    .single();

  if (!userRole) {
    redirect('/institution/signup');
  }

  const institution = userRole.institutions as any;

  // If not verified yet, redirect to pending page
  if (institution.status !== 'verified') {
    redirect('/institution/pending');
  }

  // Get institution statistics
  // Count total programs
  const { count: programCount } = await supabase
    .from('program_requirements')
    .select('*', { count: 'exact', head: true })
    .eq('institution_id', institution.id);

  // Count total courses
  const { count: courseCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('institution_id', institution.id);

  const stats = {
    program_count: programCount || 0,
    course_count: courseCount || 0,
    application_count: 0,
    active_students: 0,
  };

  // Get recent programs
  const { data: recentPrograms } = await supabase
    .from('program_requirements')
    .select('*')
    .eq('institution_id', institution.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent courses
  const { data: recentCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('institution_id', institution.id)
    .eq('is_official', true)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get pending applications
  const { data: pendingApplications } = await supabase
    .from('program_applications')
    .select(`
      *,
      program_requirements(name),
      profiles(full_name, email)
    `)
    .in('program_id', (recentPrograms || []).map((p) => p.id))
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(10);

  return (
    <InstitutionDashboard
      institution={institution}
      user={user}
      role={userRole.role as 'institution_admin' | 'institution_staff'}
      stats={stats}
      recentPrograms={recentPrograms || []}
      recentCourses={recentCourses || []}
      pendingApplications={pendingApplications || []}
    />
  );
}
