import { createRouteHandlerClient } from '@/lib/supabase/server';
import { Scenario } from '@/types';

export async function createScenario(userId: string, data: Omit<Scenario, 'id' | 'user_id' | 'created_at' | 'updated_at'>, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: scenario };
  } catch (error) {
    console.log("Create scenario error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create scenario',
    };
  }
}

export async function updateScenario(scenarioId: string, userId: string, data: Partial<Scenario>, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .update(data)
      .eq('id', scenarioId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: scenario };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update scenario',
    };
  }
}

export async function deleteScenario(scenarioId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { error } = await supabase
      .from('scenarios')
      .delete()
      .eq('id', scenarioId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete scenario',
    };
  }
}

export async function getUserScenarios(userId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: scenarios };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch scenarios',
    };
  }
}

export async function getScenarioById(scenarioId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();
    
    if (error) throw error;
    return { success: true, data: scenario };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch scenario',
    };
  }
}
