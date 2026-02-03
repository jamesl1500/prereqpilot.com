'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, RefreshCw, Plus, Check, X, Link as LinkIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SimulateRetakeModal from '@/components/modals/SimulateRetakeModal';
import AddHypotheticalCourseModal from '@/components/modals/AddHypotheticalCourseModal';
import { calculateOverallGPA } from '@/services/course-service';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/scenario-detail.module.scss';
import type { ProgramRequirementWithDetails, ProgramRequiredCourse, ProgramCourseMapping } from '@/services/program-requirement-service';

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
  program_id: string;
  description: string | null;
  created_at: string;
}

interface ScenarioDetailPageProps {
  user: User;
  scenario: Scenario;
  takenCourses: TakenCourse[];
  scenarioCourses: ScenarioCourse[];
  programs?: ProgramRequirementWithDetails[];
  mappings?: Record<string, ProgramCourseMapping[]>;
}

export default function ScenarioDetailPage({ 
  user, 
  scenario, 
  takenCourses, 
  scenarioCourses,
  programs = [],
  mappings = {},
}: ScenarioDetailPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [isRetakeModalOpen, setIsRetakeModalOpen] = useState(false);
  const [isHypotheticalModalOpen, setIsHypotheticalModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>(scenario.program_id || '');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedRequiredCourse, setSelectedRequiredCourse] = useState<ProgramRequiredCourse | null>(null);
  const [activeTab, setActiveTab] = useState<'requirements' | 'courses' | 'hypothetical'>('requirements');
  const [editingHypothetical, setEditingHypothetical] = useState<ScenarioCourse | null>(null);

  // Create a map of overridden courses
  const overrideMap = new Map(
    scenarioCourses.map(sc => [sc.taken_course_id, sc])
  );

  // Calculate current GPA (from actual taken courses)
  const coursesWithGrades = takenCourses.filter(c => c.grade && c.grade_value !== null);
  const currentGPA = calculateOverallGPA(
    coursesWithGrades.map(c => ({ grade: c.grade!, credits: c.credits }))
  );

  // Calculate scenario GPA (with simulated changes and hypothetical courses)
  const scenarioCoursesForGPA = [
    // Include actual courses with overrides
    ...takenCourses.map(course => {
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
    }),
    // Include hypothetical courses (those without taken_course_id)
    ...scenarioCourses
      .filter(sc => !sc.taken_course_id && sc.simulated_grade)
      .map(sc => ({
        grade: sc.simulated_grade!,
        credits: sc.simulated_credits || 0,
      }))
  ].filter(c => c.grade);

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

  const handleDeleteHypothetical = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this hypothetical course?')) return;

    try {
      const response = await fetch(`/api/scenarios/${scenario.id}/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Hypothetical course deleted', 'success');
        router.refresh();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to delete course', 'error');
      }
    } catch (error) {
      console.error('Error deleting hypothetical course:', error);
      showToast('Failed to delete course', 'error');
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => router.push('/scenarios')}>
          <ArrowLeft size={20} strokeWidth={2} />
          <span>Back to Scenarios</span>
        </button>
        <div className={styles.header}>
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
          <button 
            className={styles.secondaryButton}
            onClick={() => setIsHypotheticalModalOpen(true)}
          >
            <Plus size={20} strokeWidth={2} />
            <span>Add Hypothetical Course</span>
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'requirements' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('requirements')}
          >
            Program Requirements
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'courses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Your Courses
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'hypothetical' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('hypothetical')}
          >
            Hypothetical Courses ({scenarioCourses.filter(sc => !sc.taken_course_id).length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'courses' && (
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
        )}

        {/* Hypothetical Courses Tab */}
        {activeTab === 'hypothetical' && (
          <div className={styles.hypotheticalSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Hypothetical Courses</h2>
              <button 
                className={styles.primaryButton}
                onClick={() => setIsHypotheticalModalOpen(true)}
              >
                <Plus size={20} strokeWidth={2} />
                <span>Add Hypothetical Course</span>
              </button>
            </div>
            
            {scenarioCourses.filter(sc => !sc.taken_course_id).length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hypothetical courses yet. Add a "what-if" course to see how it would impact your GPA.</p>
              </div>
            ) : (
              <div className={styles.hypotheticalList}>
                {scenarioCourses
                  .filter(sc => !sc.taken_course_id)
                  .map((course) => (
                    <div key={course.id} className={styles.hypotheticalCard}>
                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>{course.simulated_course_title}</h3>
                          <span className={styles.hypotheticalBadge}>Hypothetical</span>
                        </div>
                        <div className={styles.cardDetails}>
                          <div className={styles.detail}>
                            <span className={styles.detailLabel}>Credits:</span>
                            <span className={styles.detailValue}>{course.simulated_credits}</span>
                          </div>
                          <div className={styles.detail}>
                            <span className={styles.detailLabel}>Expected Grade:</span>
                            <span className={styles.detailValue}>{course.simulated_grade}</span>
                          </div>
                          <div className={styles.detail}>
                            <span className={styles.detailLabel}>Grade Points:</span>
                            <span className={styles.detailValue}>{course.simulated_grade_value?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => {
                            setEditingHypothetical(course);
                            setIsHypotheticalModalOpen(true);
                          }}
                          className={styles.editButton}
                          title="Edit course"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHypothetical(course.id)}
                          className={styles.deleteButton}
                          title="Delete course"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Program Requirements Section */}
        {activeTab === 'requirements' && programs.length > 0 && (
          <div className={styles.requirementsSection}>
            <h2 className={styles.sectionTitle}>Program Requirements</h2>
            
            {programs.length > 1 && (
              <div className={styles.programSelector}>
                <label htmlFor="program">Select Program:</label>
                <select
                  id="program"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className={styles.programSelect}
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} {program.institution?.name && `(${program.institution.name})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {renderProgramRequirements()}
          </div>
        )}
      </div>

      <SimulateRetakeModal
        isOpen={isRetakeModalOpen}
        onClose={() => setIsRetakeModalOpen(false)}
        scenarioId={scenario.id}
        courses={getSelectedCoursesData()}
        onSuccess={handleRetakeSuccess}
      />

      <AddHypotheticalCourseModal
        isOpen={isHypotheticalModalOpen}
        onClose={() => {
          setIsHypotheticalModalOpen(false);
          setEditingHypothetical(null);
        }}
        scenarioId={scenario.id}
        editingCourse={editingHypothetical}
        onSuccess={() => {
          setEditingHypothetical(null);
          router.refresh();
        }}
      />

      {showMatchModal && selectedRequiredCourse && (
        <MatchCourseModal
          requiredCourse={selectedRequiredCourse}
          takenCourses={takenCourses}
          currentMapping={(mappings[selectedProgram] || []).find(
            m => m.program_required_course_id === selectedRequiredCourse.id
          )}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedRequiredCourse(null);
          }}
          onSave={handleSaveMapping}
        />
      )}
    </DashboardLayout>
  );

  function renderProgramRequirements() {
    const currentProgram = programs.find(p => p.id === selectedProgram);
    if (!currentProgram) return null;

    // Extract min GPAs
    const minPrereqGPA = currentProgram.min_prereq_gpa;
    const minOverallGPA = currentProgram.min_overall_gpa;

    const currentMappings = mappings[selectedProgram] || [];
    const totalRequired = currentProgram.required_courses.filter(c => c.is_required).length;
    const completedRequired = currentMappings.filter(m => {
      const course = currentProgram.required_courses.find(c => c.id === m.program_required_course_id);
      return course?.is_required && m.is_completed;
    }).length;
    const completionPercentage = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

    const coursesByCategory = currentProgram.required_courses.reduce((acc, course) => {
      const category = course.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(course);
      return acc;
    }, {} as Record<string, ProgramRequiredCourse[]>);

    return (
      <>
        {/* GPA Requirements */}
        <div className={styles.gpaRequirementsSection}>
          <h3 className={styles.gpaRequirementsTitle}>GPA Requirements</h3>
          <ul className={styles.gpaRequirementsList}>
            <li>
              <strong>Minimum Prerequisite GPA:</strong> {minPrereqGPA !== undefined && minPrereqGPA !== null ? minPrereqGPA.toFixed(2) : 'N/A'}
            </li>
            <li>
              <strong>Minimum Overall GPA:</strong> {minOverallGPA !== undefined && minOverallGPA !== null ? minOverallGPA.toFixed(2) : 'N/A'}
            </li>
          </ul>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>Completion Progress</span>
            <span className={styles.progressPercentage}>{completionPercentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {completedRequired} of {totalRequired} required courses completed
          </p>
        </div>

        {Object.entries(coursesByCategory).map(([category, courses]) => (
          <div key={category} className={styles.categoryBlock}>
            <h3 className={styles.categoryTitle}>{category}</h3>
            
            <div className={styles.requirementsList}>
              {courses.map((course) => {
                const mapping = currentMappings.find(
                  m => m.program_required_course_id === course.id
                );
                const matchedCourse = mapping?.taken_course_id
                  ? takenCourses.find(tc => tc.id === mapping.taken_course_id)
                  : null;

                return (
                  <div key={course.id} className={styles.requirementRow}>
                    <div className={styles.requirementInfo}>
                      <h4 className={styles.requirementTitle}>
                        {course.course_title}
                        {course.course_code && (
                          <span className={styles.courseCode}> ({course.course_code})</span>
                        )}
                      </h4>
                      <div className={styles.requirementMeta}>
                        <span>{course.credits} credits</span>
                        {course.min_grade && <span>Min: {course.min_grade}</span>}
                        <span className={course.is_required ? styles.requiredBadge : styles.optionalBadge}>
                          {course.is_required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      {course.description && (
                        <p className={styles.requirementDescription}>{course.description}</p>
                      )}
                    </div>

                    <div className={styles.requirementStatus}>
                      {mapping?.is_completed ? (
                        <div className={styles.completedStatus}>
                          <Check size={20} className={styles.checkIcon} />
                          <div className={styles.statusInfo}>
                            <span>Completed</span>
                            {matchedCourse && (
                              <span className={styles.matchedCourse}>
                                {matchedCourse.course_title}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : mapping ? (
                        <div className={styles.inProgressStatus}>
                          <X size={20} className={styles.xIcon} />
                          <span>Not Completed</span>
                        </div>
                      ) : null}
                      
                      <button
                        onClick={() => handleMatchCourse(course)}
                        className={styles.matchButton}
                      >
                        <LinkIcon size={16} />
                        {mapping ? 'Update' : 'Match'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>
    );
  }

  function handleMatchCourse(requiredCourse: ProgramRequiredCourse) {
    setSelectedRequiredCourse(requiredCourse);
    setShowMatchModal(true);
  }

  async function handleSaveMapping(takenCourseId: string | null, isCompleted: boolean) {
    if (!selectedRequiredCourse) return;

    try {
      const response = await fetch(`/api/programs/${selectedProgram}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_required_course_id: selectedRequiredCourse.id,
          taken_course_id: takenCourseId,
          is_completed: isCompleted,
        }),
      });

      if (response.ok) {
        showToast('Mapping saved successfully', 'success');
        router.refresh();
        setShowMatchModal(false);
        setSelectedRequiredCourse(null);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save mapping', 'error');
      }
    } catch {
      // Error loading scenario
      showToast('Failed to save mapping', 'error');
    }
  }
}

// Modal for matching taken courses to required courses
function MatchCourseModal({
  requiredCourse,
  takenCourses,
  currentMapping,
  onClose,
  onSave,
}: {
  requiredCourse: ProgramRequiredCourse;
  takenCourses: TakenCourse[];
  currentMapping?: ProgramCourseMapping;
  onClose: () => void;
  onSave: (takenCourseId: string | null, isCompleted: boolean) => Promise<void>;
}) {
  const [selectedCourse, setSelectedCourse] = useState<string>(
    currentMapping?.taken_course_id || ''
  );
  const [isCompleted, setIsCompleted] = useState(currentMapping?.is_completed || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(selectedCourse || null, isCompleted);
    setIsSubmitting(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Match Course</h2>
        
        <div className={styles.requiredCourseInfo}>
          <h3>{requiredCourse.course_title}</h3>
          {requiredCourse.course_code && <p>Code: {requiredCourse.course_code}</p>}
          <p>{requiredCourse.credits} credits required</p>
          {requiredCourse.min_grade && <p>Minimum grade: {requiredCourse.min_grade}</p>}
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="takenCourse">Select a course you've taken:</label>
            <select
              id="takenCourse"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={styles.courseSelect}
            >
              <option value="">-- None / Not taken yet --</option>
              {takenCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_title} ({course.credits} credits
                  {course.grade && `, Grade: ${course.grade}`})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
              />
              <span>Mark as completed</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
