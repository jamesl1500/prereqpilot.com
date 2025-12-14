/**
 * Institution Service
 * Handles all business logic for institution operations
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';
import type { Institution } from '@/types/institution';

export interface CreateInstitutionData {
  name: string;
  short_code: string;
  country?: string | null;
  website?: string | null;
}

export interface UpdateInstitutionData extends CreateInstitutionData {
  id: string;
}

/**
 * Create a new institution
 */
export async function createInstitution(
  data: CreateInstitutionData,
  request: Request
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createRouteHandlerClient(request);

    const institutionData = {
      name: data.name,
      short_code: data.short_code,
      country: data.country || null,
      website: data.website || null,
    };

    const { error } = await supabase
      .from('institutions')
      .insert([institutionData]);

    if (error) throw error;

    // Mark step as completed in onboarding

    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create institution',
    };
  }
}

/**
 * Update an existing institution
 */
export async function updateInstitution(
  institutionId: string,
  data: CreateInstitutionData,
  request: Request
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createRouteHandlerClient(request);

    const institutionData = {
      name: data.name,
      short_code: data.short_code,
      country: data.country || null,
      website: data.website || null,
    };

    const { error } = await supabase
      .from('institutions')
      .update(institutionData)
      .eq('id', institutionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update institution',
    };
  }
}

/**
 * Delete an institution
 */
export async function deleteInstitution(
  institutionId: string,
  request: Request
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createRouteHandlerClient(request);

    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('id', institutionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete institution',
    };
  }
}

/**
 * Get all institutions
 */
export async function getAllInstitutions(
  request: Request
): Promise<{
  success: boolean;
  data?: Institution[];
  error?: string;
}> {
  try {
    const supabase = createRouteHandlerClient(request);

    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return { success: true, data: data as Institution[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch institutions',
    };
  }
}

/**
 * Get institution by ID
 */
export async function getInstitutionById(
  institutionId: string,
  request: Request
): Promise<{ success: boolean; data?: Institution; error?: string }> {
  try {
    const supabase = createRouteHandlerClient(request);

    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', institutionId)
      .single();

    if (error) throw error;

    return { success: true, data: data as Institution };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch institution',
    };
  }
}
