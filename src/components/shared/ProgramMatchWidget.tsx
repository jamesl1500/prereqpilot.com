'use client';

import Link from 'next/link';
import { Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import styles from '@/styles/modules/pages/dashboard.module.scss';

interface RequiredCourse {
  id: string;
  course_title: string;
  is_required: boolean;
  min_grade: string | null;
  credits: number;
}

interface Program {
  id: string;
  name: string;
  min_overall_gpa: number | null;
  min_prereq_gpa: number | null;
  institution: { name: string; short_code: string | null } | null;
  program_required_courses: RequiredCourse[];
}

interface TakenCourse {
  course_title: string;
  grade_value: number | null;
}

interface ProgramMatchWidgetProps {
  programs: Program[];
  takenCourses: TakenCourse[];
  overallGPA: number | null;
}

function titleMatch(required: string, taken: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const r = normalize(required);
  const t = normalize(taken);
  return r === t || r.includes(t) || t.includes(r);
}

function computeMatch(program: Program, takenCourses: TakenCourse[], overallGPA: number | null) {
  const required = program.program_required_courses.filter((c) => c.is_required);
  const optional = program.program_required_courses.filter((c) => !c.is_required);

  let matchedRequired = 0;
  const matchedDetails: { course: RequiredCourse; satisfied: boolean }[] = [];

  for (const req of required) {
    const satisfied = takenCourses.some((taken) => titleMatch(req.course_title, taken.course_title));
    if (satisfied) matchedRequired++;
    matchedDetails.push({ course: req, satisfied });
  }

  const courseScore =
    required.length > 0 ? Math.round((matchedRequired / required.length) * 100) : 100;

  const gpaOk =
    !program.min_overall_gpa ||
    (overallGPA !== null && overallGPA >= program.min_overall_gpa);

  const gpaDisplay =
    program.min_overall_gpa != null
      ? { required: program.min_overall_gpa, current: overallGPA, ok: gpaOk }
      : null;

  // Weighted overall: courses 75%, GPA 25%
  const gpaPoints = gpaDisplay ? (gpaOk ? 25 : 0) : 0;
  const coursePoints = gpaDisplay ? courseScore * 0.75 : courseScore;
  const overall = Math.round(coursePoints + gpaPoints);

  return { courseScore, matchedRequired, totalRequired: required.length, totalOptional: optional.length, gpaDisplay, overall, matchedDetails };
}

export default function ProgramMatchWidget({
  programs,
  takenCourses,
  overallGPA,
}: ProgramMatchWidgetProps) {
  if (programs.length === 0) {
    return (
      <div className={styles.matchSection}>
        <h3 className={styles.sectionTitle}>Program Match</h3>
        <div className={styles.matchEmptyState}>
          <Target size={40} strokeWidth={1.5} />
          <p>Add programs to see your match score</p>
          <Link href="/programs" className={styles.matchEmptyLink}>
            Browse Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.matchSection}>
      <div className={styles.matchHeader}>
        <h3 className={styles.sectionTitle}>Program Match</h3>
        <Link href="/programs" className={styles.matchViewAll}>
          View All
        </Link>
      </div>
      <div className={styles.matchGrid}>
        {programs.map((program) => {
          const { courseScore, matchedRequired, totalRequired, gpaDisplay, overall, matchedDetails } =
            computeMatch(program, takenCourses, overallGPA);

          const scoreColor = overall >= 75 ? '#000' : overall >= 50 ? '#555' : '#999';

          return (
            <div key={program.id} className={styles.matchCard}>
              <div className={styles.matchCardTop}>
                <div>
                  <h4 className={styles.matchProgramName}>{program.name}</h4>
                  {program.institution?.name && (
                    <p className={styles.matchInstitution}>{program.institution.name}</p>
                  )}
                </div>
                <div className={styles.matchScore} style={{ color: scoreColor }}>
                  {overall}%
                </div>
              </div>

              {/* Score bar */}
              <div className={styles.matchBarWrapper}>
                <div
                  className={styles.matchBar}
                  style={{ width: `${overall}%` }}
                  aria-valuenow={overall}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              {/* Breakdown */}
              <div className={styles.matchBreakdown}>
                <div className={styles.matchBreakdownItem}>
                  {matchedRequired === totalRequired && totalRequired > 0 ? (
                    <CheckCircle size={14} className={styles.iconPass} />
                  ) : (
                    <AlertCircle size={14} className={styles.iconWarn} />
                  )}
                  <span>
                    {totalRequired === 0
                      ? 'No required courses listed'
                      : `${matchedRequired} / ${totalRequired} required courses`}
                  </span>
                </div>

                {gpaDisplay && (
                  <div className={styles.matchBreakdownItem}>
                    {gpaDisplay.ok ? (
                      <CheckCircle size={14} className={styles.iconPass} />
                    ) : (
                      <XCircle size={14} className={styles.iconFail} />
                    )}
                    <span>
                      GPA {gpaDisplay.current != null ? gpaDisplay.current.toFixed(2) : 'N/A'}{' '}
                      / {gpaDisplay.required.toFixed(2)} required
                    </span>
                  </div>
                )}
              </div>

              {/* Missing courses */}
              {matchedDetails.filter((d) => !d.satisfied).length > 0 && (
                <div className={styles.matchMissing}>
                  <p className={styles.matchMissingLabel}>Missing:</p>
                  {matchedDetails
                    .filter((d) => !d.satisfied)
                    .slice(0, 3)
                    .map((d) => (
                      <span key={d.course.id} className={styles.matchMissingBadge}>
                        {d.course.course_title}
                      </span>
                    ))}
                  {matchedDetails.filter((d) => !d.satisfied).length > 3 && (
                    <span className={styles.matchMissingMore}>
                      +{matchedDetails.filter((d) => !d.satisfied).length - 3} more
                    </span>
                  )}
                </div>
              )}

              <Link href={`/programs/${program.id}`} className={styles.matchViewDetails}>
                View Details →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
