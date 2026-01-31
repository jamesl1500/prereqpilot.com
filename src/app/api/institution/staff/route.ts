import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/error_logs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role, institution_id } = body;

    // Validate required fields
    if (!email || !name || !role || !institution_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is admin of the institution
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('institution_id', institution_id)
      .eq('role', 'institution_admin')
      .single();

    if (!adminRole) {
      return NextResponse.json(
        { error: 'Only institution admins can invite staff members' },
        { status: 403 }
      );
    }

    // Check if user already exists with this email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;

      // Check if user is already staff at this institution
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('institution_id', institution_id)
        .single();

      if (existingRole) {
        return NextResponse.json(
          { error: 'This user is already a staff member at your institution' },
          { status: 400 }
        );
      }
    } else {
      // Create new user account
      const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name,
        },
      });

      if (signUpError || !newUser.user) {
        await logApiError({
          request,
          error: signUpError ?? 'Failed to create user account',
          functionName: 'POST',
          userId: user.id,
          payloadSent: body,
        });
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
    }

    // Create user_role entry
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      institution_id,
      role,
    });

    if (roleError) {
      await logApiError({
        request,
        error: roleError,
        functionName: 'POST',
        userId: user.id,
        payloadSent: body,
      });
      return NextResponse.json({ error: 'Failed to assign role to user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member invited successfully',
    });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'POST',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's institution
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('institution_id, role')
      .eq('user_id', user.id)
      .or('role.eq.institution_admin,role.eq.institution_staff')
      .single();

    if (!userRole) {
      return NextResponse.json({ error: 'No institution found' }, { status: 404 });
    }

    // Get all staff for the institution
    const { data: staffMembers, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .eq('institution_id', userRole.institution_id)
      .order('created_at', { ascending: false });

    if (error) {
      await logApiError({
        request,
        error,
        functionName: 'GET',
        userId: user.id,
      });
      return NextResponse.json({ error: 'Failed to fetch staff members' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: staffMembers });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'GET',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
