'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import styles from '@/styles/modules/pages/dashboard.module.scss';

const GRADE_OPTIONS = [
  { label: 'A+ (4.0)', value: 4.0, grade: 'A+' },
  { label: 'A  (4.0)', value: 4.0, grade: 'A' },
  { label: 'A- (3.7)', value: 3.7, grade: 'A-' },
  { label: 'B+ (3.3)', value: 3.3, grade: 'B+' },
  { label: 'B  (3.0)', value: 3.0, grade: 'B' },
  { label: 'B- (2.7)', value: 2.7, grade: 'B-' },
  { label: 'C+ (2.3)', value: 2.3, grade: 'C+' },
  { label: 'C  (2.0)', value: 2.0, grade: 'C' },
  { label: 'C- (1.7)', value: 1.7, grade: 'C-' },
  { label: 'D+ (1.3)', value: 1.3, grade: 'D+' },
  { label: 'D  (1.0)', value: 1.0, grade: 'D' },
  { label: 'D- (0.7)', value: 0.7, grade: 'D-' },
  { label: 'F  (0.0)', value: 0.0, grade: 'F' },
];

interface HypoCourse {
  id: string;
  title: string;
  credits: number;
  gradeValue: number;
  grade: string;
}

interface GPAProjectorProps {
  currentCourses: { credits: number; grade_value: number | null }[];
  currentGPA: number | null;
}

function calcGPA(courses: { credits: number; gradeValue: number }[]): number | null {
  const valid = courses.filter((c) => c.credits > 0);
  if (valid.length === 0) return null;
  const totalPoints = valid.reduce((s, c) => s + c.gradeValue * c.credits, 0);
  const totalCredits = valid.reduce((s, c) => s + c.credits, 0);
  return totalCredits > 0 ? totalPoints / totalCredits : null;
}

let nextId = 1;

export default function GPAProjector({ currentCourses, currentGPA }: GPAProjectorProps) {
  const [hypotheticals, setHypotheticals] = useState<HypoCourse[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const projectedGPA = useMemo(() => {
    const existing = currentCourses
      .filter((c) => c.grade_value !== null && c.credits > 0)
      .map((c) => ({ credits: Number(c.credits), gradeValue: Number(c.grade_value) }));

    const hypo = hypotheticals
      .filter((h) => h.credits > 0)
      .map((h) => ({ credits: h.credits, gradeValue: h.gradeValue }));

    return calcGPA([...existing, ...hypo]);
  }, [currentCourses, hypotheticals]);

  const delta =
    projectedGPA !== null && currentGPA !== null ? projectedGPA - currentGPA : null;

  const addCourse = () => {
    setHypotheticals((prev) => [
      ...prev,
      { id: String(nextId++), title: '', credits: 3, gradeValue: 4.0, grade: 'A' },
    ]);
  };

  const removeCourse = (id: string) => {
    setHypotheticals((prev) => prev.filter((h) => h.id !== id));
  };

  const updateCourse = (id: string, field: keyof HypoCourse, value: string | number) => {
    setHypotheticals((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        if (field === 'gradeValue') {
          const grade = GRADE_OPTIONS.find((g) => g.value === Number(value));
          return { ...h, gradeValue: Number(value), grade: grade?.grade ?? String(value) };
        }
        return { ...h, [field]: field === 'credits' ? Number(value) : value };
      })
    );
  };

  const deltaColor = delta === null ? '#000' : delta > 0 ? '#166534' : delta < 0 ? '#991b1b' : '#000';
  const deltaSign = delta !== null ? (delta >= 0 ? '+' : '') : '';

  return (
    <div className={styles.projectorSection}>
      <div
        className={styles.projectorHeader}
        onClick={() => setIsExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
      >
        <div className={styles.projectorTitleGroup}>
          <TrendingUp size={20} strokeWidth={2.5} />
          <h3 className={styles.projectorTitle}>GPA Projector</h3>
          <span className={styles.projectorBadge}>Interactive</span>
        </div>
        <span className={styles.projectorToggle}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className={styles.projectorBody}>
          <div className={styles.projectorStats}>
            <div className={styles.projectorStat}>
              <span className={styles.projectorStatLabel}>Current GPA</span>
              <span className={styles.projectorStatValue}>
                {currentGPA !== null ? currentGPA.toFixed(3) : 'N/A'}
              </span>
            </div>
            <div className={styles.projectorArrow}>→</div>
            <div className={styles.projectorStat}>
              <span className={styles.projectorStatLabel}>Projected GPA</span>
              <span className={styles.projectorStatValue} style={{ color: deltaColor }}>
                {projectedGPA !== null ? projectedGPA.toFixed(3) : 'N/A'}
              </span>
            </div>
            {delta !== null && (
              <div className={styles.projectorDelta} style={{ color: deltaColor }}>
                {deltaSign}{delta.toFixed(3)}
              </div>
            )}
          </div>

          <p className={styles.projectorHint}>
            Add hypothetical future courses below to project your GPA.
          </p>

          {hypotheticals.length === 0 ? (
            <div className={styles.projectorEmpty}>
              No hypothetical courses added yet.
            </div>
          ) : (
            <div className={styles.projectorCourseList}>
              {hypotheticals.map((h) => (
                <div key={h.id} className={styles.projectorCourseRow}>
                  <input
                    type="text"
                    placeholder="Course title (optional)"
                    value={h.title}
                    onChange={(e) => updateCourse(h.id, 'title', e.target.value)}
                    className={styles.projectorInput}
                  />
                  <input
                    type="number"
                    min={0.5}
                    max={12}
                    step={0.5}
                    value={h.credits}
                    onChange={(e) => updateCourse(h.id, 'credits', e.target.value)}
                    className={styles.projectorCreditsInput}
                    aria-label="Credits"
                  />
                  <select
                    value={h.gradeValue}
                    onChange={(e) => updateCourse(h.id, 'gradeValue', e.target.value)}
                    className={styles.projectorGradeSelect}
                    aria-label="Grade"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.grade} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeCourse(h.id)}
                    className={styles.projectorRemoveBtn}
                    aria-label="Remove course"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={addCourse} className={styles.projectorAddBtn}>
            <Plus size={16} />
            Add Course
          </button>
        </div>
      )}
    </div>
  );
}
