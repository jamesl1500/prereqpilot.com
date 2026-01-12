import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstitutionsPage from './InstitutionsPage';

export default async function Institutions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch institutions associated with the user
    const { data: userInstitutions } = await supabase
        .from('institutions')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    // Return page
    return <InstitutionsPage user={user} institutions={userInstitutions || []} />;
}