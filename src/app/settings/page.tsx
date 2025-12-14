import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsPage from './SettingsPage';

export const metadata = {
  title: 'Settings | Prereq Pilot',
  description: 'Manage your account settings',
};

export default async function Settings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={user}>
      <SettingsPage user={user} />
    </DashboardLayout>
  );
}
