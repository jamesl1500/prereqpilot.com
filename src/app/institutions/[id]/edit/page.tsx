import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditInstitutionPage from './EditInstitutionPage';

export default async function EditInstitution({params}: {params: Promise<{ id: string }>;})
{
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if(!user)
    {
        redirect('/login')
    }

    // Fetch institution with ownership verification
    const { data: institution, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if(error || !institution)
    {
        redirect('/institutions')
    }

    return (<EditInstitutionPage institution={institution} user={user} />);
}