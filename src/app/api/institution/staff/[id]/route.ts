import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/error_logs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the staff member to be deleted
    const { data: staffToDelete } = await supabase
      .from('user_roles')
      .select('user_id, institution_id')
      .eq('id', id)
      .single();

    if (!staffToDelete) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Prevent deleting yourself
    if (staffToDelete.user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the institution' },
        { status: 400 }
      );
    }

    // Verify user is admin of the institution
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('institution_id', staffToDelete.institution_id)
      .eq('role', 'institution_admin')
      .single();

    if (!adminRole) {
      return NextResponse.json(
        { error: 'Only institution admins can remove staff members' },
        { status: 403 }
      );
    }

    // Delete the user_role entry
    const { error: deleteError } = await supabase.from('user_roles').delete().eq('id', id);

    if (deleteError) {
      await logApiError({
        request,
        error: deleteError,
        functionName: 'DELETE',
        userId: user.id,
        payloadReceived: { id },
      });
      return NextResponse.json({ error: 'Failed to remove staff member' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member removed successfully',
    });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'DELETE',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    // Get the staff member to be updated
    const { data: staffToUpdate } = await supabase
      .from('user_roles')
      .select('user_id, institution_id')
      .eq('id', id)
      .single();

    if (!staffToUpdate) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Verify user is admin of the institution
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('institution_id', staffToUpdate.institution_id)
      .eq('role', 'institution_admin')
      .single();

    if (!adminRole) {
      return NextResponse.json(
        { error: 'Only institution admins can update staff roles' },
        { status: 403 }
      );
    }

    // Update the role
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('id', id);

    if (updateError) {
      await logApiError({
        request,
        error: updateError,
        functionName: 'PUT',
        userId: user.id,
        payloadSent: body,
      });
      return NextResponse.json({ error: 'Failed to update staff role' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Staff role updated successfully',
    });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'PUT',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
