import { createRouteHandlerClient } from '@/lib/supabase/server';
import { CourseData } from '@/types';

export const gradeToGPA: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0
};

export async function createCourse(userId: string, data: CourseData, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: course, error } = await supabase
      .from('taken_courses')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: course };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create course',
    };
  }
}

export async function updateCourse(courseId: string, userId: string, data: Partial<CourseData>, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: course, error } = await supabase
      .from('taken_courses')
      .update(data)
      .eq('id', courseId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data: course };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update course',
    };
  }
}

export async function deleteCourse(courseId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { error } = await supabase
      .from('taken_courses')
      .delete()
      .eq('id', courseId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete course',
    };
  }
}

export async function getUserCourses(userId: string, request: Request) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: courses, error } = await supabase
      .from('taken_courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data: courses };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch courses',
    };
  }
}

export function calculateOverallGPA(courses: { grade: string; credits: number }[]): number {
  let totalPoints = 0;
  let totalCredits = 0;
  
  for (const course of courses) {
    const gpa = gradeToGPA[course.grade];
    if (gpa !== undefined) {
      totalPoints += gpa * course.credits;
      totalCredits += course.credits;
    }
  }
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}
