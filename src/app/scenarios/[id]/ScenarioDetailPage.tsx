'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, RefreshCw, Plus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SimulateRetakeModal from '@/components/modals/SimulateRetakeModal';
import { calculateOverallGPA } from '@/services/course-service';
import styles from '@/styles/modules/pages/scenario-detail.module.scss';

interface TakenCourse {
  id: string;
  course_title: string;
  credits: number;
  grade: string | null;
  grade_value: number | null;
  term_id: string | null;
  course?: {
    code?: string;
  };
  institution?: {
    name: string;
  };
  term?: {
    name: string;
  };
}

interface ScenarioCourse {
  id: string;
  scenario_id: string;
  taken_course_id: string | null;
  simulated_grade: string | null;
  simulated_grade_value: number | null;
  simulated_credits: number | null;
  simulated_course_title: string | null;
  taken_course?: TakenCourse;
}

interface Scenario {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ScenarioDetailPageProps {
  user: User;
  scenario: Scenario;
  takenCourses: TakenCourse[];
  scenarioCourses: ScenarioCourse[];
}

export default function ScenarioDetailPage({ 
  user, 
  scenario, 
  takenCourses, 
  scenarioCourses 
}: ScenarioDetailPageProps) {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [isRetakeModalOpen, setIsRetakeModalOpen] = useState(false);

  // Create a map of overridden courses
  const overrideMap = new Map(
    scenarioCourses.map(sc => [sc.taken_course_id, sc])
  );

  // Calculate current GPA (from actual taken courses)
  const coursesWithGrades = takenCourses.filter(c => c.grade && c.grade_value !== null);
  const currentGPA = calculateOverallGPA(
    coursesWithGrades.map(c => ({ grade: c.grade!, credits: c.credits }))
  );

  // Calculate scenario GPA (with simulated changes)
  const scenarioCoursesForGPA = takenCourses.map(course => {
    const override = overrideMap.get(course.id);
    if (override) {
      return {
        grade: override.simulated_grade || course.grade || '',
        credits: override.simulated_credits || course.credits,
      };
    }
    return {
      grade: course.grade || '',
      credits: course.credits,
    };
  }).filter(c => c.grade);

  const scenarioGPA = calculateOverallGPA(scenarioCoursesForGPA);

  const toggleCourseSelection = (courseId: string) => {
    const newSelection = new Set(selectedCourses);
    if (newSelection.has(courseId)) {
      newSelection.delete(courseId);
    } else {
      newSelection.add(courseId);
    }
    setSelectedCourses(newSelection);
  };

  const handleSimulateRetake = () => {
    if (selectedCourses.size > 0) {
      setIsRetakeModalOpen(true);
    }
  };

  const handleRetakeSuccess = () => {
    setSelectedCourses(new Set());
    router.refresh();
  };

  const getSelectedCoursesData = () => {
    return takenCourses.filter(c => selectedCourses.has(c.id));
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push('/scenarios')}>
            <ArrowLeft size={20} strokeWidth={2} />
            <span>Back to Scenarios</span>
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{scenario.name}</h1>
            {scenario.description && (
              <p className={styles.description}>{scenario.description}</p>
            )}
          </div>
        </div>

        <div className={styles.gpaComparison}>
          <div className={styles.gpaCard}>
            <div className={styles.gpaLabel}>Current GPA</div>
            <div className={styles.gpaValue}>{currentGPA.toFixed(2)}</div>
          </div>
          <div className={styles.gpaArrow}>
            <TrendingUp size={32} strokeWidth={2} />
          </div>
          <div className={`${styles.gpaCard} ${styles.projected}`}>
            <div className={styles.gpaLabel}>Projected GPA</div>
            <div className={styles.gpaValue}>{scenarioGPA.toFixed(2)}</div>
            <div className={styles.gpaChange}>
              {scenarioGPA > currentGPA ? '+' : ''}
              {(scenarioGPA - currentGPA).toFixed(2)}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={handleSimulateRetake}
            disabled={selectedCourses.size === 0}
          >
            <RefreshCw size={20} strokeWidth={2} />
            <span>Simulate Retake ({selectedCourses.size})</span>
          </button>
          <button className={styles.secondaryButton}>
            <Plus size={20} strokeWidth={2} />
            <span>Add Hypothetical Course</span>
          </button>
        </div>

        <div className={styles.coursesSection}>
          <h2 className={styles.sectionTitle}>Your Courses</h2>
          
          {takenCourses.length === 0 ? (
            <div className={styles.emptyCourses}>
              <p>No courses found. Add courses in the Classes page first.</p>
              <button 
                className={styles.primaryButton}
                onClick={() => router.push('/classes')}
              >
                Go to Classes
              </button>
            </div>
          ) : (
            <div className={styles.coursesTable}>
              <div className={styles.tableHeader}>
                <div className={styles.checkboxCol}></div>
                <div className={styles.courseCol}>Course</div>
                <div className={styles.creditsCol}>Credits</div>
                <div className={styles.gradeCol}>Grade</div>
                <div className={styles.projectedCol}>Simulated</div>
              </div>
              
              {takenCourses.map((course) => {
                const override = overrideMap.get(course.id);
                const isOverridden = !!override;
                
                return (
                  <div 
                    key={course.id} 
                    className={`${styles.tableRow} ${isOverridden ? styles.overridden : ''}`}
                  >
                    <div className={styles.checkboxCol}>
                      <input
                        type="checkbox"
                        checked={selectedCourses.has(course.id)}
                        onChange={() => toggleCourseSelection(course.id)}
                      />
                    </div>
                    <div className={styles.courseCol}>
                      <div className={styles.courseTitle}>
                        {course.course?.code && (
                          <span className={styles.courseCode}>{course.course.code}</span>
                        )}
                        {course.course_title}
                      </div>
                      {course.institution && (
                        <div className={styles.courseInstitution}>
                          {course.institution.name}
                        </div>
                      )}
                    </div>
                    <div className={styles.creditsCol}>
                      {course.credits}
                    </div>
                    <div className={styles.gradeCol}>
                      {course.grade || 'N/A'}
                    </div>
                    <div className={styles.projectedCol}>
                      {isOverridden ? (
                        <div className={styles.simulatedGrade}>
                          {override.simulated_grade || 'N/A'}
                          {override.simulated_grade !== course.grade && (
                            <span className={styles.changeIndicator}>
                              (was {course.grade})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.noChange}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SimulateRetakeModal
        isOpen={isRetakeModalOpen}
        onClose={() => setIsRetakeModalOpen(false)}
        scenarioId={scenario.id}
        courses={getSelectedCoursesData()}
        onSuccess={handleRetakeSuccess}
      />
    </DashboardLayout>
  );
}
