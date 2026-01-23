import { createRouteHandlerClient } from '@/lib/supabase/server';
import { Program } from '@/types';

export async function createProgram(userId: string, data: Omit<Program, 'id' | 'user_id' | 'created_at'>, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: program, error } = await supabase
      .from('program_requirements')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create program',
    };
  }
}

export async function updateProgram(programId: string, userId: string, data: Partial<Program>, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: program, error } = await supabase
      .from('program_requirements')
      .update(data)
      .eq('id', programId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update program',
    };
  }
}

export async function deleteProgram(programId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { error } = await supabase
      .from('program_requirements')
      .delete()
      .eq('id', programId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete program',
    };
  }
}

export async function getUserPrograms(userId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: programs, error } = await supabase
      .from('program_requirements')
      .select('*, institution:institutions(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: programs };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch programs',
    };
  }
}

export async function getAllPrograms(request: Request, filter?: string) {
  try {
    const supabase = createRouteHandlerClient(request);
    if(filter && filter === "official") {
      const { data: programs, error } = await supabase
        .from('program_requirements')
        .select('*, institution:institutions(*)')
        .eq('is_official', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data: programs };
    }else if(filter && filter === "user"){
      const { data: programs, error } = await supabase
        .from('program_requirements')
        .select('*, institution:institutions(*)')
        .eq('is_official', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data: programs };
    }

    const { data: programs, error } = await supabase
      .from('program_requirements')
      .select('*, institution:institutions(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: programs };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch programs',
    };
  }
}

export async function getProgramById(programId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: program, error } = await supabase
      .from('programs')
      .select('*, institution:institutions(*)')
      .eq('id', programId)
      .single();
    
    if (error) throw error;
    return { success: true, data: program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch program',
    };
  }
}

export function meetsGPARequirements(currentGPA: number, requiredGPA: number): boolean {
  return currentGPA >= requiredGPA;
}
