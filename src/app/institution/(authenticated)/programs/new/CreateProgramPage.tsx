'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Institution } from '@/types/institution';
import { ArrowLeft, Save, GraduationCap } from 'lucide-react';
import styles from '@/styles/modules/pages/institution-program-form.module.scss';

const programSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  requirements_text: z.string().optional(),
  min_prereq_gpa: z.number().min(0).max(4.0).nullable().optional(),
  min_overall_gpa: z.number().min(0).max(4.0).nullable().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface CreateProgramPageProps {
  institution: Institution;
}

export default function CreateProgramPage({ institution }: CreateProgramPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: '',
      description: '',
      requirements_text: '',
      min_prereq_gpa: null,
      min_overall_gpa: null,
    },
  });

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          requirements_text: data.requirements_text || null,
          institution: institution.name,
          institution_id: institution.id,
          min_prereq_gpa: data.min_prereq_gpa || null,
          min_overall_gpa: data.min_overall_gpa || null,
          is_official: true,
          is_published: true,
        }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to create program');
      }
      router.push('/institution/programs');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button onClick={() => router.push('/institution/programs')} className={styles.backButton}>
        <ArrowLeft size={20} strokeWidth={2} />
        Back to Programs
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <GraduationCap size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Create New Program</h1>
            <p className={styles.subtitle}>Add a new academic program for {institution.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && (
            <div className={styles.errorBox}>
              <p>{error}</p>
            </div>
          )}

          {/* Program Name */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Program Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Bachelor of Science in Computer Science"
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              className={styles.textarea}
              placeholder="Brief overview of the program..."
              disabled={isSubmitting}
              rows={4}
            />
            {errors.description && (
              <span className={styles.fieldError}>{errors.description.message}</span>
            )}
            <span className={styles.fieldHint}>
              A brief description of the program
            </span>
          </div>

          {/* Requirements Text */}
          <div className={styles.formGroup}>
            <label htmlFor="requirements_text" className={styles.label}>
              Requirements
            </label>
            <textarea
              id="requirements_text"
              {...register('requirements_text')}
              className={styles.textarea}
              placeholder="List admission requirements, prerequisites, etc..."
              disabled={isSubmitting}
              rows={6}
            />
            {errors.requirements_text && (
              <span className={styles.fieldError}>{errors.requirements_text.message}</span>
            )}
            <span className={styles.fieldHint}>
              Detailed admission requirements and prerequisites
            </span>
          </div>

          {/* Min Prereq GPA */}
          <div className={styles.formGroup}>
            <label htmlFor="min_prereq_gpa" className={styles.label}>
              Minimum Prerequisite GPA
            </label>
            <input
              id="min_prereq_gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              {...register('min_prereq_gpa', { 
                valueAsNumber: true,
                setValueAs: (v) => v === '' ? null : parseFloat(v)
              })}
              className={styles.input}
              placeholder="e.g., 2.5"
              disabled={isSubmitting}
            />
            {errors.min_prereq_gpa && (
              <span className={styles.fieldError}>{errors.min_prereq_gpa.message}</span>
            )}
            <span className={styles.fieldHint}>
              Minimum GPA required for prerequisite courses
            </span>
          </div>

          {/* Min Overall GPA */}
          <div className={styles.formGroup}>
            <label htmlFor="min_overall_gpa" className={styles.label}>
              Minimum Overall GPA
            </label>
            <input
              id="min_overall_gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              {...register('min_overall_gpa', { 
                valueAsNumber: true,
                setValueAs: (v) => v === '' ? null : parseFloat(v)
              })}
              className={styles.input}
              placeholder="e.g., 3.0"
              disabled={isSubmitting}
            />
            {errors.min_overall_gpa && (
              <span className={styles.fieldError}>{errors.min_overall_gpa.message}</span>
            )}
            <span className={styles.fieldHint}>
              Minimum overall GPA required for admission
            </span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => router.push('/institution/programs')}
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
              <Save size={20} strokeWidth={2} />
              {isSubmitting ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
