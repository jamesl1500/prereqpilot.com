import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstitutionsPage from './InstitutionsPage';

export default async function Institutions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch institutions associated with the user (user-created institutions)
    const { data: userInstitutions } = await supabase
        .from('institutions')
        .select(`
            *,
            courses:courses(count)
        `)
        .eq('user_id', user.id)
        .order('name');

    // Fetch all official/verified institutions
    const { data: officialInstitutions } = await supabase
        .from('institutions')
        .select(`
            *,
            courses:courses(count)
        `)
        .eq('is_official', true)
        .eq('status', 'verified')
        .order('name');

    // Return page
    return <InstitutionsPage 
        user={user} 
        userInstitutions={userInstitutions || []} 
        officialInstitutions={officialInstitutions || []}
    />;
}