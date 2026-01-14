import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewInstitutionPage from './NewInstitutionPage';

export default async function NewInstitution() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <NewInstitutionPage user={user} />;
}
