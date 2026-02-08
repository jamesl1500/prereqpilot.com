import { createServiceRoleClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';

export async function GET(request: Request) {
  try {
    const serviceRoleClient = createServiceRoleClient();
    
    const { data: authUsers, error } = await serviceRoleClient
      .from('auth.users')
      .select('id, email')
      .limit(5);

    if (error) {
      await logApiError({
        request,
        error,
        functionName: 'GET',
      });
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ 
      success: true,
      count: authUsers?.length,
      authUsers
    });
  } catch (error: unknown) {
    await logApiError({
      request,
      error,
      functionName: 'GET',
    });
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
