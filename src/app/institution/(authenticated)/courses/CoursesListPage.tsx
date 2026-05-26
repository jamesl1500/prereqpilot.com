'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Institution } from '@/types/institution';
import { BookOpen, Plus, Edit2, Trash2, Eye, Search, Filter, GraduationCap } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/institution-courses-list.module.scss';

interface Course {
  id: string;
  institution_id: string;
  code: string;
  title: string;
  credits: number;
  description: string | null;
  department: string | null;
  level: string | null;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

interface CoursesListPageProps {
  institution: Institution;
  courses: Course[];
  totalCourses: number;
}

export default function CoursesListPage({ institution, courses: initialCourses, totalCourses }: CoursesListPageProps) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [sortBy, setSortBy] = useState<'code' | 'title' | 'credits' | 'created_at'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(
      courses
        .map(c => c.department)
        .filter((dept): dept is string => Boolean(dept))
    );
    return Array.from(depts).sort();
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    const result = courses.filter(course => {
      const matchesSearch = 
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesDepartment = !filterDepartment || course.department === filterDepartment;
      const matchesLevel = !filterLevel || course.level === filterLevel;
      
      return matchesSearch && matchesDepartment && matchesLevel;
    });

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      
      switch (sortBy) {
        case 'code':
          aVal = a.code.toLowerCase();
          bVal = b.code.toLowerCase();
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'credits':
          aVal = a.credits;
          bVal = b.credits;
          break;
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [courses, searchQuery, filterDepartment, filterLevel, sortBy, sortOrder]);

  const handleDelete = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/institution/courses/${courseId}`, { method: 'DELETE' });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to delete course');
      }
      setCourses(prev => prev.filter(c => c.id !== courseId));
      showToast('Course deleted successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete course', 'error');
    }
  };

  const getLevelLabel = (level: string | null) => {
    if (!level) return '';
    const labels: Record<string, string> = {
      '100': 'Intro',
      '200': 'Lower',
      '300': 'Upper',
      '400': 'Advanced',
      '500': 'Graduate',
    };
    return labels[level] || level;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDepartment('');
    setFilterLevel('');
    setSortBy('code');
    setSortOrder('asc');
  };

  const hasFilters = searchQuery || filterDepartment || filterLevel;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <BookOpen size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Course Catalog</h1>
            <p className={styles.subtitle}>
              {institution.name} • {totalCourses} {totalCourses === 1 ? 'course' : 'courses'}
            </p>
          </div>
        </div>
        <Link href="/institution/courses/new" className={styles.primaryButton}>
          <Plus size={20} />
          <span>Add Course</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by code, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={16} />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Levels</option>
            <option value="100">100 - Introductory</option>
            <option value="200">200 - Lower Division</option>
            <option value="300">300 - Upper Division</option>
            <option value="400">400 - Advanced</option>
            <option value="500">500 - Graduate</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortOrder(order as typeof sortOrder);
            }}
            className={styles.filterSelect}
          >
            <option value="code-asc">Code (A-Z)</option>
            <option value="code-desc">Code (Z-A)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="credits-asc">Credits (Low-High)</option>
            <option value="credits-desc">Credits (High-Low)</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className={styles.clearButton}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {hasFilters && (
        <div className={styles.resultsCount}>
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className={styles.empty}>
          <GraduationCap size={48} strokeWidth={1.5} />
          <h3>{hasFilters ? 'No courses match your filters' : 'No courses yet'}</h3>
          <p>
            {hasFilters 
              ? 'Try adjusting your search or filters' 
              : 'Add courses to your institution\'s catalog to use them in program requirements.'
            }
          </p>
          {!hasFilters && (
            <Link href="/institution/courses/new" className={styles.primaryButton}>
              <Plus size={20} />
              <span>Add First Course</span>
            </Link>
          )}
          {hasFilters && (
            <button onClick={clearFilters} className={styles.secondaryButton}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.coursesGrid}>
          {filteredCourses.map((course) => (
            <Link 
              key={course.id} 
              href={`/institution/courses/${course.id}`}
              className={styles.courseCard}
            >
              <div className={styles.courseHeader}>
                <div>
                  <h3 className={styles.courseCode}>{course.code}</h3>
                  <p className={styles.courseTitle}>{course.title}</p>
                </div>
                <div className={styles.courseMeta}>
                  <div className={styles.courseCredits}>{course.credits} CR</div>
                  {course.level && (
                    <div className={styles.courseLevel}>{getLevelLabel(course.level)}</div>
                  )}
                </div>
              </div>
              
              {course.department && (
                <p className={styles.courseDepartment}>{course.department}</p>
              )}

              {course.description && (
                <p className={styles.courseDescription}>
                  {course.description.length > 100 
                    ? `${course.description.substring(0, 100)}...` 
                    : course.description
                  }
                </p>
              )}

              <div className={styles.courseActions}>
                <Link
                  href={`/institution/courses/${course.id}`}
                  className={styles.viewButton}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye size={16} />
                  <span>View</span>
                </Link>
                <Link
                  href={`/institution/courses/${course.id}/edit`}
                  className={styles.editButton}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={(e) => handleDelete(course.id, e)}
                  className={styles.deleteButton}
                  title="Delete course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
