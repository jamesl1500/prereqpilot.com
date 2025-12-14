'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, BookOpen, GraduationCap, Search, School2, Pencil } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CourseModal from '@/components/modals/CourseModal';
import DeleteModal from '@/components/modals/DeleteModal';
import TermModal from '@/components/modals/TermModal';
import NoTermsPrompt from '@/components/modals/NoTermsPrompt';
import TutorialTooltip from '@/components/onboarding/TutorialTooltip';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import styles from '@/styles/modules/pages/classes.module.scss';
import type { Course } from '@/types/course';
import type { Term } from '@/types/term';
import type { Institution } from '@/types/institution';

interface OnboardingData {
  onboarding_completed: boolean;
  current_step: string | null;
  steps_completed: string[];
}

interface ClassesPageProps {
  user: User;
  takenCourses: Course[];
  terms: Term[];
  institutions: Institution[];
  onboarding: OnboardingData | null;
}

export default function ClassesPage({ user, takenCourses, terms, institutions, onboarding }: ClassesPageProps) {
  const router = useRouter();
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isNoTermsPromptOpen, setIsNoTermsPromptOpen] = useState(false);
  const [selectedTermForEdit, setSelectedTermForEdit] = useState<Term | undefined>();
  
  const showOnboarding = !!(onboarding && !onboarding.onboarding_completed && onboarding.current_step === 'courses' && !onboarding.steps_completed.includes('courses'));

  const handleOnboardingComplete = () => {
    router.refresh();
  };

  const filteredCourses = takenCourses.filter(course => {
    const matchesTerm = selectedTerm === 'all' || course.term_id === selectedTerm;
    const matchesSearch = course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTerm && matchesSearch;
  });

  const totalCredits = filteredCourses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
  const coursesWithGrades = filteredCourses.filter(c => c.grade_value !== null);
  const averageGPA = coursesWithGrades.length > 0
    ? coursesWithGrades.reduce((sum, c) => sum + Number(c.grade_value || 0), 0) / coursesWithGrades.length
    : null;

  const handleAddCourse = () => {
    if (terms.length === 0) {
      setIsNoTermsPromptOpen(true);
      return;
    }
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const handleAddTerm = () => {
    setSelectedTermForEdit(undefined);
    setIsTermModalOpen(true);
  };

  const handleEditTerm = (term: Term) => {
    setSelectedTermForEdit(term);
    setIsTermModalOpen(true);
  };

  const handleCreateTermFromPrompt = () => {
    setIsNoTermsPromptOpen(false);
    setIsTermModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  // Group courses by term
  const coursesByTerm = terms.map(term => ({
    term,
    courses: takenCourses.filter(course => {
      const matchesTerm = course.term_id === term.id;
      const matchesSearch = !searchQuery || 
        course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course?.code?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTerm && matchesSearch;
    }),
  })).filter(group => selectedTerm === 'all' || group.term.id === selectedTerm);

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Classes</h1>
            <p className={styles.subtitle}>
              Manage your academic course history
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.secondaryButton} onClick={handleAddTerm}>
              + Manage Terms
            </button>
            <button className={styles.addButton} onClick={handleAddCourse}>
              + Add Course
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className={styles.termSelect}
          >
            <option value="all">All Terms</option>
            {terms.map(term => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Stats */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Courses</span>
            <span className={styles.summaryValue}>{filteredCourses.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Credits</span>
            <span className={styles.summaryValue}>{totalCredits.toFixed(1)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Average GPA</span>
            <span className={styles.summaryValue}>
              {averageGPA !== null ? averageGPA.toFixed(2) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Courses List */}
        {terms.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Calendar size={80} strokeWidth={1.5} /></div>
            <h3 className={styles.emptyTitle}>No terms created yet</h3>
            <p className={styles.emptyText}>
              Create your first term (semester) to start organizing your courses
            </p>
            <button className={styles.addButton} onClick={handleAddTerm}>
              + Create Your First Term
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><BookOpen size={80} strokeWidth={1.5} /></div>
            <h3 className={styles.emptyTitle}>No courses found</h3>
            <p className={styles.emptyText}>
              {searchQuery || selectedTerm !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first course to get started'}
            </p>
          </div>
        ) : (
          <div className={styles.termsContainer}>
            {coursesByTerm.map(({ term, courses }) => (
              courses.length > 0 && (
                <div key={term.id} className={styles.termSection}>
                  <div className={styles.termHeader}>
                    <div>
                      <h2 className={styles.termName}>{term.name}</h2>
                      {(term.start_date || term.end_date) && (
                        <p className={styles.termDates}>
                          {term.start_date && new Date(term.start_date).toLocaleDateString()}
                          {term.start_date && term.end_date && ' - '}
                          {term.end_date && new Date(term.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className={styles.termStats}>
                      <span className={styles.termStat}>
                        {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                      </span>
                      <span className={styles.termStat}>
                        {courses.reduce((sum, c) => sum + Number(c.credits || 0), 0).toFixed(1)} credits
                      </span>
                      <button 
                        className={styles.termEditButton} 
                        onClick={() => handleEditTerm(term)}
                        title="Edit term"
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.coursesList}>
                    {courses.map(course => (
                      <div key={course.id} className={styles.courseCard}>
                        <div className={styles.courseHeader}>
                          <div>
                            <h3 className={styles.courseTitle}>{course.course_title}</h3>
                            {course.course?.code && (
                              <p className={styles.courseCode}>{course.course.code}</p>
                            )}
                          </div>
                          <div className={styles.courseGrade}>
                            {course.grade || 'IP'}
                          </div>
                        </div>

                        <div className={styles.courseDetails}>
                          {course.institution && (
                            <div className={styles.detail}>
                              <span className={styles.detailIcon}>
                                <School2 size={16} strokeWidth={2} />
                              </span>
                              <span>{course.institution.name}</span>
                            </div>
                          )}
                          <div className={styles.detail}>
                            <span className={styles.detailIcon}>
                              <GraduationCap size={16} strokeWidth={2} />
                            </span>
                            <span>{Number(course.credits).toFixed(1)} credits</span>
                          </div>
                        </div>

                        {course.notes && (
                          <p className={styles.courseNotes}>{course.notes}</p>
                        )}

                        <div className={styles.courseActions}>
                          <button className={styles.actionButton} onClick={() => handleEditCourse(course)}>
                            Edit
                          </button>
                          <button className={styles.actionButton} onClick={() => handleDeleteCourse(course)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        <CourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          course={selectedCourse}
          terms={terms}
          institutions={institutions}
        />

        <TermModal
          isOpen={isTermModalOpen}
          onClose={() => setIsTermModalOpen(false)}
          term={selectedTermForEdit}
        />

        <NoTermsPrompt
          isOpen={isNoTermsPromptOpen}
          onClose={() => setIsNoTermsPromptOpen(false)}
          onCreateTerm={handleCreateTermFromPrompt}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          itemType="course"
          itemId={selectedCourse?.id || ''}
          itemName={selectedCourse?.course_title || ''}
        />

        <TutorialTooltip
          tutorialType="courses"
          title="Track Your Courses"
          description="Add courses you've completed with their grades and credits. Your GPA will be calculated automatically!"
          position="bottom"
        />

        <OnboardingModal
          isOpen={showOnboarding}
          currentStep={onboarding?.current_step || 'dashboard_intro'}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </DashboardLayout>
  );
}
