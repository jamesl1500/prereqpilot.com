'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types/institution';
import { Plus, Edit, Trash2, BookOpen, GraduationCap } from 'lucide-react';
import styles from '@/styles/modules/pages/institution-programs.module.scss';

interface Program {
  id: string;
  name: string;
  institution: string | null;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
  created_at: string;
  program_required_courses: { count: number }[];
}

interface InstitutionProgramsPageProps {
  user: User;
  institution: Institution;
  programs: Program[];
}

export default function InstitutionProgramsPage({ user, institution, programs }: InstitutionProgramsPageProps) {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (programId: string) => {
    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete program');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the program');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <GraduationCap size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Programs</h1>
            <p className={styles.subtitle}>Manage academic programs for {institution.name}</p>
          </div>
        </div>
        <Link href="/institution/programs/new" className={styles.createButton}>
          <Plus size={20} strokeWidth={2} />
          Create Program
        </Link>
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen size={64} strokeWidth={1.5} />
          <h2>No Programs Yet</h2>
          <p>Create your first program to get started</p>
          <Link href="/institution/programs/new" className={styles.emptyButton}>
            <Plus size={20} strokeWidth={2} />
            Create Program
          </Link>
        </div>
      ) : (
        <div className={styles.programsGrid}>
          {programs.map((program) => (
            <div key={program.id} className={styles.programCard}>
              <div className={styles.cardHeader}>
                <BookOpen size={24} strokeWidth={2} />
                <h3 className={styles.programName}>{program.name}</h3>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Required Courses:</span>
                  <span className={styles.statValue}>
                    {program.program_required_courses[0]?.count || 0}
                  </span>
                </div>
                
                {program.min_prereq_gpa && (
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Min Prereq GPA:</span>
                    <span className={styles.statValue}>{program.min_prereq_gpa}</span>
                  </div>
                )}
                
                {program.min_overall_gpa && (
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Min Overall GPA:</span>
                    <span className={styles.statValue}>{program.min_overall_gpa}</span>
                  </div>
                )}
              </div>
              
              <div className={styles.cardActions}>
                <Link 
                  href={`/institution/programs/${program.id}`}
                  className={styles.viewButton}
                >
                  View Details
                </Link>
                <Link 
                  href={`/institution/programs/${program.id}/edit`}
                  className={styles.editButton}
                >
                  <Edit size={16} />
                  Edit
                </Link>
                {deleteConfirm === program.id ? (
                  <div className={styles.deleteConfirm}>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className={styles.confirmDelete}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className={styles.cancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(program.id)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
