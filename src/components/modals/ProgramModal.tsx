'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import type { ProgramModalProps } from '@/types/modal';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

interface Institution {
  id: string;
  name: string;
  short_code: string | null;
  country: string | null;
  status: string;
  is_official: boolean;
  logo_url: string | null;
}

const programSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  institution_id: z.string().optional(),
  institution: z.string().optional(),
  min_prereq_gpa: z.number().min(0).max(4).optional().nullable(),
  min_overall_gpa: z.number().min(0).max(4).optional().nullable(),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface ExtendedProgramModalProps extends ProgramModalProps {
  userInstitutions: Institution[];
  allInstitutions: Institution[];
}

export default function ProgramModal({ isOpen, onClose, program, userInstitutions, allInstitutions }: ExtendedProgramModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: program ? {
      name: program.name,
      institution_id: program.institution_id || '',
      institution: program.institution || '',
      min_prereq_gpa: program.min_prereq_gpa,
      min_overall_gpa: program.min_overall_gpa,
    } : {
      institution_id: '',
      institution: '',
    },
  });

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const programData = {
        name: data.name,
        institution_id: data.institution_id || null,
        institution: data.institution || null,
        min_prereq_gpa: data.min_prereq_gpa || null,
        min_overall_gpa: data.min_overall_gpa || null,
      };

      if (program) {
        await axios.put(`/api/programs/${program.id}`, programData);
      } else {
        await axios.post('/api/programs', programData);
      }

      reset();
      router.refresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="program-modal-title">
            {program ? 'Edit Program' : 'Add Program'}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className={styles.form}
          aria-label={program ? 'Edit program form' : 'Add program form'}
        >
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Program Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Computer Science Major"
              aria-required="true"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span className={styles.fieldError} id="name-error" role="alert">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="institution_id" className={styles.label}>
              Institution
            </label>
            <select
              id="institution_id"
              {...register('institution_id')}
              className={styles.input}
            >
              <option value="">Select an institution (optional)</option>
              
              {userInstitutions.length > 0 && (
                <optgroup label="Your Institutions">
                  {userInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </optgroup>
              )}
              
              {allInstitutions.length > 0 && (
                <optgroup label="Available Institutions">
                  {allInstitutions
                    .filter(inst => !userInstitutions.some(ui => ui.id === inst.id))
                    .map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <p className={styles.helperText}>
              Select an institution from the list or leave blank
            </p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="min_prereq_gpa" className={styles.label}>
                Min Prerequisite GPA
              </label>
              <input
                id="min_prereq_gpa"
                type="number"
                step="0.01"
                {...register('min_prereq_gpa', { valueAsNumber: true })}
                className={styles.input}
                placeholder="0.00 - 4.00"
              />
              {errors.min_prereq_gpa && (
                <span className={styles.fieldError}>{errors.min_prereq_gpa.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="min_overall_gpa" className={styles.label}>
                Min Overall GPA
              </label>
              <input
                id="min_overall_gpa"
                type="number"
                step="0.01"
                {...register('min_overall_gpa', { valueAsNumber: true })}
                className={styles.input}
                placeholder="0.00 - 4.00"
              />
              {errors.min_overall_gpa && (
                <span className={styles.fieldError}>{errors.min_overall_gpa.message}</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? 'Saving...' : program ? 'Update' : 'Add Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
