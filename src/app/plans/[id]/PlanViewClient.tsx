'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { AcademicPlanWithDetails, CreatePlanTermData } from '@/types/plan';
import {
    CalendarDays,
    Plus,
    ArrowLeft,
    BookOpen,
    Trash2,
    CheckCircle2,
    Circle,
    ChevronRight,
    ChevronDown,
    Pencil
} from 'lucide-react';
import {
    createPlanTerm,
    deletePlanTerm,
    addPlannedCourse,
    deletePlannedCourse,
    markCourseCompleted,
    updatePlanTerm,
} from '@/services/plan-service';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/PlanView.module.scss';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EditCourseModal from '@/components/modals/EditCourseModal';
import EditTermModal from '@/components/modals/EditTermModal';
import type { PlannedCourse, PlanTerm } from '@/types/plan';

interface Course {
    id: string;
    code: string;
    title: string;
    credits: number;
    institution_id: string;
}

interface PlanViewClientProps {
    user: User;
    plan: AcademicPlanWithDetails;
    courses: Course[];
}

enum TermType {
    Fall = 'Fall',
    Spring = 'Spring',
    Summer = 'Summer',
    Winter = 'Winter',
    Session = 'Session'
}

export default function PlanViewClient({ user, plan: initialPlan, courses }: PlanViewClientProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
    const [showCreateTerm, setShowCreateTerm] = useState(false);
    const [showAddCourse, setShowAddCourse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showEditCourse, setShowEditCourse] = useState<string | null>(null);
    const [showEditTerm, setShowEditTerm] = useState(false);
    const [editingTerm, setEditingTerm] = useState<PlanTerm | null>(null);

    const [termName, setTermName] = useState('');
    const [termType, setTermType] = useState<TermType>(TermType.Fall);
    const [termYear, setTermYear] = useState(new Date().getFullYear());
    const [termCreditsTarget, setTermCreditsTarget] = useState<number>(15);

    const [courseSearch, setCourseSearch] = useState('');
    const [courseTitle, setCourseTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [courseCredits, setCourseCredits] = useState<number>(3);
    const [editingCourse, setEditingCourse] = useState<PlannedCourse | null>(null);

    const handleEditCourse = (courseId: string) => {
        // Find the course in the plan
        for (const term of initialPlan.plan_terms || []) {
            const course = term.planned_courses?.find(c => c.id === courseId);
            if (course) {
                setEditingCourse(course);
                setShowEditCourse(courseId);
                break;
            }
        }
    };

    const toggleTerm = (termId: string) => {
        setExpandedTerms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(termId)) {
                newSet.delete(termId);
            } else {
                newSet.add(termId);
            }
            return newSet;
        });
    };

    const handleCreateTerm = async () => {
        if (!termName.trim()) return;

        setIsLoading(true);
        try {
            await createPlanTerm(initialPlan.id, {
                name: termName,
                term_type: termType,
                year: termYear,
                credits_target: termCreditsTarget,
            });

            setTermName('');
            setTermType(TermType.Fall);
            setTermYear(new Date().getFullYear());
            setTermCreditsTarget(15);
            setShowCreateTerm(false);
            showToast('Term created successfully', 'success');
            router.refresh();
        } catch (error) {
            console.error('Error creating term:', error);
            showToast('Failed to create term', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditTerm = (term: PlanTerm) => {
        setEditingTerm(term);
        setShowEditTerm(true);
    };

    const handleUpdateTerm = async (termId: string, updates: Partial<CreatePlanTermData>) => {
        setIsLoading(true);
        try {
            await updatePlanTerm(termId, updates);
            setShowEditTerm(false);
            setEditingTerm(null);
            router.refresh();
        } catch (error) {
            console.error('Error updating term:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTerm = async (termId: string) => {
        if (!confirm('Are you sure you want to delete this term? This will remove all courses in it.')) {
            return;
        }

        setIsLoading(true);
        try {
            await deletePlanTerm(termId);
            showToast('Term deleted successfully', 'success');
            router.refresh();
        } catch (error) {
            console.error('Error deleting term:', error);
            showToast('Failed to delete term', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCourse = async (termId: string) => {
        if (!courseTitle.trim()) return;

        setIsLoading(true);
        try {
            await addPlannedCourse(termId, {
                course_title: courseTitle,
                course_code: courseCode || undefined,
                credits: courseCredits,
            });

            setCourseTitle('');
            setCourseCode('');
            setCourseCredits(3);
            setCourseSearch('');
            setShowAddCourse(null);
            showToast('Course added successfully', 'success');
            router.refresh();
        } catch (error) {
            console.error('Error adding course:', error);
            showToast('Failed to add course', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        setIsLoading(true);
        try {
            await deletePlannedCourse(courseId);
            showToast('Course removed successfully', 'success');
            router.refresh();
        } catch (error) {
            console.error('Error deleting course:', error);
            showToast('Failed to delete course', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleComplete = async (courseId: string, isCompleted: boolean) => {
        setIsLoading(true);
        try {
            await markCourseCompleted(courseId, !isCompleted);
            showToast(isCompleted ? 'Course marked as incomplete' : 'Course marked as complete', 'success');
            router.refresh();
        } catch (error) {
            console.error('Error updating course:', error);
            showToast('Failed to update course', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        courseSearch && (
            c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
            c.title.toLowerCase().includes(courseSearch.toLowerCase())
        )
    );

    const getTermCredits = (termId: string) => {
        const term = initialPlan.plan_terms?.find(t => t.id === termId);
        if (!term) return 0;
        return term.planned_courses?.reduce((sum, c) => sum + c.credits, 0) || 0;
    };

    return (
        <DashboardLayout user={user}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.push('/plans')} className={styles.backButton}>
                        <ArrowLeft size={20} />
                        Back to Plans
                    </button>
                    <div className={styles.headerContent}>
                        <div>
                            <h1 className={styles.title}>{initialPlan.name}</h1>
                            {initialPlan.description && (
                                <p className={styles.subtitle}>{initialPlan.description}</p>
                            )}
                        </div>
                        <button onClick={() => setShowCreateTerm(true)} className={styles.addButton}>
                            <Plus size={18} />
                            Add Term
                        </button>
                    </div>
                </div>

                {/* Terms List */}
                <div className={styles.content}>
                    {initialPlan.plan_terms && initialPlan.plan_terms.length > 0 ? (
                        <div className={styles.termsList}>
                            {initialPlan.plan_terms
                                .sort((a, b) => a.display_order - b.display_order)
                                .map(term => {
                                    const termCredits = getTermCredits(term.id);
                                    const isExpanded = expandedTerms.has(term.id);

                                    return (
                                        <div key={term.id} className={styles.termCard}>
                                            <div className={styles.termHeader} onClick={() => toggleTerm(term.id)}>
                                                <div className={styles.termInfo}>
                                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                    <div>
                                                        <h3>{term.name}</h3>
                                                        <p className={styles.termMeta}>
                                                            {term.term_type} {term.year} • &nbsp;
                                                            {term.planned_courses?.length || 0} courses • &nbsp;
                                                            {termCredits.toFixed(1)} credits
                                                            {term.credits_target && ` / ${term.credits_target} target`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={styles.termActions}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditTerm(term);
                                                        }}
                                                        className={styles.iconButton}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTerm(term.id);
                                                        }}
                                                        className={styles.iconButton}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className={styles.termContent}>
                                                    {term.planned_courses && term.planned_courses.length > 0 ? (
                                                        <div className={styles.coursesList}>
                                                            {term.planned_courses
                                                                .sort((a, b) => a.display_order - b.display_order)
                                                                .map(course => (
                                                                    <div key={course.id} className={styles.courseItem}>
                                                                        <button
                                                                            onClick={() => handleToggleComplete(course.id, course.is_completed)}
                                                                            className={styles.checkbox}
                                                                        >
                                                                            {course.is_completed ? (
                                                                                <CheckCircle2 size={20} className={styles.checked} />
                                                                            ) : (
                                                                                <Circle size={20} />
                                                                            )}
                                                                        </button>
                                                                        <div className={styles.courseInfo}>
                                                                            <div className={styles.courseTitle}>
                                                                                {course.course_code && (
                                                                                    <span className={styles.courseCode}>{course.course_code}</span>
                                                                                )}
                                                                                <span className={course.is_completed ? styles.completed : ''}>
                                                                                    {course.course_title}
                                                                                </span>
                                                                            </div>
                                                                            <span className={styles.courseCredits}>{course.credits} CR</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleEditCourse(course.id)}
                                                                            className={styles.iconButton}
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteCourse(course.id)}
                                                                            className={styles.iconButton}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ) : (
                                                        <div className={styles.emptyCourses}>
                                                            <BookOpen size={32} strokeWidth={1.5} />
                                                            <p>No courses yet</p>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => setShowAddCourse(term.id)}
                                                        className={styles.addCourseButton}
                                                    >
                                                        <Plus size={16} />
                                                        Add Course
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className={styles.emptyTerms}>
                            <CalendarDays size={48} strokeWidth={1.5} />
                            <p>No terms yet. Add your first term to start planning.</p>
                            <button onClick={() => setShowCreateTerm(true)} className={styles.primaryButton}>
                                <Plus size={18} />
                                Add First Term
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Term Modal */}
                {showCreateTerm && (
                    <div className={styles.modal} onClick={() => setShowCreateTerm(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h3 className={styles.modalTitle}>Add Term</h3>

                            <div className={styles.formGroup}>
                                <label>Term Name *</label>
                                <input
                                    type="text"
                                    value={termName}
                                    onChange={(e) => setTermName(e.target.value)}
                                    placeholder="e.g., Fall 2024"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Term Type</label>
                                    <select
                                        value={termType}
                                        onChange={(e) => setTermType(e.target.value as TermType)}
                                        className={styles.select}
                                    >
                                        <option value="Fall">Fall</option>
                                        <option value="Spring">Spring</option>
                                        <option value="Summer">Summer</option>
                                        <option value="Winter">Winter</option>
                                        <option value="Session">Session</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Year</label>
                                    <input
                                        type="number"
                                        value={termYear}
                                        onChange={(e) => setTermYear(parseInt(e.target.value))}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Credits Target</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={termCreditsTarget}
                                    onChange={(e) => setTermCreditsTarget(parseFloat(e.target.value))}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowCreateTerm(false)}
                                    className={styles.secondaryButton}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTerm}
                                    className={styles.primaryButton}
                                    disabled={isLoading || !termName.trim()}
                                >
                                    {isLoading ? 'Adding...' : 'Add Term'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Course Modal */}
                {showAddCourse && (
                    <div className={styles.modal} onClick={() => setShowAddCourse(null)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h3 className={styles.modalTitle}>Add Course</h3>

                            <div className={styles.formGroup}>
                                <label>Search Existing Courses</label>
                                <input
                                    type="text"
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                    placeholder="Search by code or title..."
                                    className={styles.input}
                                />
                                {courseSearch && filteredCourses.length > 0 && (
                                    <div className={styles.searchResults}>
                                        {filteredCourses.slice(0, 5).map(course => (
                                            <button
                                                key={course.id}
                                                onClick={() => {
                                                    setCourseTitle(course.title);
                                                    setCourseCode(course.code);
                                                    setCourseCredits(course.credits);
                                                    setCourseSearch('');
                                                }}
                                                className={styles.searchResult}
                                            >
                                                <span className={styles.resultCode}>{course.code}</span>
                                                <span className={styles.resultTitle}>{course.title}</span>
                                                <span className={styles.resultCredits}>{course.credits} CR</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.divider}>
                                <span>Or create custom</span>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Course Title *</label>
                                <input
                                    type="text"
                                    value={courseTitle}
                                    onChange={(e) => setCourseTitle(e.target.value)}
                                    placeholder="e.g., Introduction to Computer Science"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Course Code</label>
                                    <input
                                        type="text"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                        placeholder="e.g., CS 101"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Credits *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={courseCredits}
                                        onChange={(e) => setCourseCredits(parseFloat(e.target.value))}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowAddCourse(null)}
                                    className={styles.secondaryButton}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => showAddCourse && handleAddCourse(showAddCourse)}
                                    className={styles.primaryButton}
                                    disabled={isLoading || !courseTitle.trim()}
                                >
                                    {isLoading ? 'Adding...' : 'Add Course'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Course Modal */}
                <EditCourseModal
                    isOpen={showEditCourse !== null}
                    onClose={() => {
                        setShowEditCourse(null);
                        setEditingCourse(null);
                    }}
                    course={editingCourse}
                    onUpdate={() => {
                        router.refresh();
                    }}
                />

                {/* Edit Term Modal */}
                {editingTerm && (
                    <EditTermModal
                        isOpen={showEditTerm}
                        onClose={() => {
                            setShowEditTerm(false);
                            setEditingTerm(null);
                        }}
                        term={{
                            id: editingTerm.id,
                            name: editingTerm.name,
                            term_type: editingTerm.term_type || undefined,
                            year: editingTerm.year || undefined,
                            credits_target: editingTerm.credits_target || undefined,
                            notes: editingTerm.notes || undefined,
                        }}
                        onUpdate={handleUpdateTerm}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
