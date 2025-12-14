import { createRouteHandlerClient } from '@/lib/supabase/server';

export interface OnboardingStatus {
  onboarding_completed: boolean;
  current_step: string | null;
  steps_completed: string[];
}

export interface TutorialProgress {
  tutorial_type: string;
  completed: boolean;
  skipped: boolean;
}

export async function getOnboardingStatus(userId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    // If no record exists, create one
    if (!data) {
      const { data: newOnboarding, error: createError } = await supabase
        .from('user_onboarding')
        .insert([{
          user_id: userId,
          current_step: 'dashboard_intro',
          steps_completed: []
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      return { success: true, data: newOnboarding };
    }
    
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get onboarding status',
    };
  }
}

export async function updateOnboardingStep(userId: string, step: string, completed: string[], request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data, error } = await supabase
      .from('user_onboarding')
      .update({
        current_step: step,
        steps_completed: completed
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update onboarding step',
    };
  }
}

export async function completeOnboarding(userId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data, error } = await supabase
      .from('user_onboarding')
      .update({
        onboarding_completed: true,
        current_step: null
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete onboarding',
    };
  }
}

export async function getTutorialProgress(userId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data, error } = await supabase
      .from('tutorial_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tutorial progress',
    };
  }
}

export async function markTutorialComplete(userId: string, tutorialType: string, skipped: boolean, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data, error } = await supabase
      .from('tutorial_progress')
      .insert([{
        user_id: userId,
        tutorial_type: tutorialType,
        completed: !skipped,
        skipped: skipped,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark tutorial complete',
    };
  }
}
