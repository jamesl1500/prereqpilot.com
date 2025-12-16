import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { InstitutionSignupData } from '@/types/institution';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const body: InstitutionSignupData = await request.json();

    const {
      institutionName,
      domain,
      contactEmail,
      adminName,
      adminEmail,
      adminPassword,
      website,
      description,
      address,
    } = body;

    // Validate required fields
    if (!institutionName || !domain || !contactEmail || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email domains match
    const contactDomain = contactEmail.split('@')[1];
    const adminDomain = adminEmail.split('@')[1];

    if (contactDomain !== domain || adminDomain !== domain) {
      return NextResponse.json(
        { error: 'Email addresses must match the specified domain' },
        { status: 400 }
      );
    }

    // Check if domain is already registered
    const { data: existingInstitution } = await supabase
      .from('institutions')
      .select('id')
      .eq('domain', domain)
      .eq('is_official', true)
      .single();

    if (existingInstitution) {
      return NextResponse.json(
        { error: 'An institution with this domain is already registered' },
        { status: 409 }
      );
    }

    // Create admin user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: adminName,
          role: 'institution_admin',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/institution/verify`,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(32).toString('hex');

    // Create institution record
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .insert({
        name: institutionName,
        short_code: institutionName.substring(0, 10).toUpperCase().replace(/\s/g, ''),
        domain,
        contact_email: contactEmail,
        website_url: website,
        description,
        address,
        status: 'pending',
        is_official: true,
        institution_admin_id: authData.user.id,
        verification_code: verificationCode,
        metadata: {
          registration_date: new Date().toISOString(),
          admin_name: adminName,
        },
      })
      .select()
      .single();

    if (institutionError) {
      // Rollback: Delete the user if institution creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: 'Failed to create institution record' },
        { status: 500 }
      );
    }

    // Create user_role record
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'institution_admin',
        institution_id: institution.id,
      });

    if (roleError) {
      console.error('Failed to create user role:', roleError);
      // Continue anyway - can be fixed manually
    }

    // TODO: Send verification email with verification code
    // This would typically integrate with an email service like SendGrid, AWS SES, etc.

    return NextResponse.json({
      success: true,
      message: 'Institution registered successfully. Please check your email to verify your account.',
      institutionId: institution.id,
      requiresEmailVerification: true,
    });

  } catch (error: unknown) {
    console.error('Institution registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
