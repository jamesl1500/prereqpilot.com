import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsPage from './SettingsPage';

export const metadata = {
  title: 'Settings | PrereqPilot',
  description: 'Manage your account settings',
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <SettingsPage user={user} />;
}
