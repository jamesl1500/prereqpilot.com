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

    // Fetch institution
    const { data: institution, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', id)
        .single()

    if(error || !institution)
    {
        redirect('/institutions')
    }

    // Check if they're the owner
    const isOwner = institution.user_id === user.id;

    // If its custom and user doesnt own it, redirect to institutions page
    if(institution.user_id && !isOwner)
    {
        redirect('/institutions')
    }

    // Now pass the institution data to component
    return (<EditInstitutionPage institution={institution} user={user} />);
}