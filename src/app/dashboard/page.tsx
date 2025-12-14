import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardPage from './DashboardPage';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch onboarding status
  const { data: onboardingData } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch user stats
  const [coursesResult, termsResult, auditsResult] = await Promise.all([
    supabase
      .from('taken_courses')
      .select('id, credits, grade_value')
      .eq('user_id', user.id),
    supabase
      .from('terms')
      .select('id')
      .eq('user_id', user.id),
    supabase
      .from('audits')
      .select('overall_gpa, prereq_gpa, computed_at')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: false })
      .limit(1)
  ]);

  const courses = coursesResult.data || [];
  const terms = termsResult.data || [];
  const latestAudit = auditsResult.data?.[0];

  // Calculate overall GPA from courses
  const coursesWithGrades = courses.filter(course => 
    course.grade_value !== null && 
    course.grade_value !== undefined &&
    Number(course.credits) > 0
  );

  let overallGPA: number | null = null;
  if (coursesWithGrades.length > 0) {
    const totalGradePoints = coursesWithGrades.reduce((sum, course) => {
      const credits = Number(course.credits) || 0;
      const gradeValue = Number(course.grade_value) || 0;
      return sum + (credits * gradeValue);
    }, 0);

    const totalCredits = coursesWithGrades.reduce((sum, course) => 
      sum + (Number(course.credits) || 0), 0
    );

    if (totalCredits > 0) {
      overallGPA = totalGradePoints / totalCredits;
    }
  }

  const stats = {
    totalCourses: courses.length,
    totalCredits: courses.reduce((sum, course) => sum + (Number(course.credits) || 0), 0),
    totalTerms: terms.length,
    overallGPA: overallGPA || latestAudit?.overall_gpa || null,
    prereqGPA: latestAudit?.prereq_gpa || null,
  };

  return <DashboardPage user={user} stats={stats} onboarding={onboardingData} />;
}
