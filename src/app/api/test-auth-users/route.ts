import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const serviceRoleClient = createServiceRoleClient();
    
    const { data: authUsers, error } = await serviceRoleClient
      .from('auth.users')
      .select('id, email')
      .limit(5);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ 
      success: true,
      count: authUsers?.length,
      authUsers
    });
  } catch (error: any) {
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
