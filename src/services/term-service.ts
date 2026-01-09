/**
 * Term Service
 * ----
 * Term services and CRUD functions
 * 
 * @module services/term-service
 */
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { TermData } from '@/types';

/**
 * createTerm
 * ----
 * Creates a term for logged in user
 * 
 * @param userId 
 * @param data 
 * @param request 
 * @returns JSON response
 */
export async function createTerm(userId: string, data: TermData, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: term, error } = await supabase
      .from('terms')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: term };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create term',
    };
  }
}

export async function updateTerm(termId: string, userId: string, data: Partial<TermData>, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: term, error } = await supabase
      .from('terms')
      .update(data)
      .eq('id', termId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: term };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update term',
    };
  }
}

export async function deleteTerm(termId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { error } = await supabase
      .from('terms')
      .delete()
      .eq('id', termId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete term',
    };
  }
}

export async function getUserTerms(userId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: terms, error } = await supabase
      .from('terms')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return { success: true, data: terms };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch terms',
    };
  }
}

export async function getTermById(termId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: term, error } = await supabase
      .from('terms')
      .select('*')
      .eq('id', termId)
      .single();
    
    if (error) throw error;
    return { success: true, data: term };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch term',
    };
  }
}

export function validateTermDates(startDate: string, endDate: string): boolean {
  return new Date(startDate) < new Date(endDate);
}
