'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import type { ScenarioModalProps } from '@/types/modal';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/modals/CourseModal.module.scss';
import { Program } from '@/types';

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  program_id: z.string().min(1, 'Program is required'),
  description: z.string().optional(),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

export default function ScenarioModal({ isOpen, onClose, scenario }: ScenarioModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPrograms, setUserPrograms] = useState<Program[]>([]);
  const [officialPrograms, setOfficialPrograms] = useState<Program[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: scenario ? {
      name: scenario.name,
      program_id: scenario.program_id,
      description: scenario.description || '',
    } : undefined,
  });

  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const userRes = await axios.get('/api/programs?filter=user');
          setUserPrograms(userRes.data.data || []);
        } catch {
          setUserPrograms([]);
        }
        try {
          const officialRes = await axios.get('/api/programs?filter=official');
          setOfficialPrograms(officialRes.data.data || []);
        } catch {
          setOfficialPrograms([]);
        }

        // Reset form with scenario data after programs are loaded
        if (scenario) {
          reset({
            name: scenario.name,
            program_id: scenario.program_id || '',
            description: scenario.description || '',
          });
        } else {
          reset({
            name: '',
            program_id: '',
            description: '',
          });
        }
      })();
    }
  }, [isOpen, scenario, reset]);

  const onSubmit = async (data: ScenarioFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!scenario) {
        const [coursesResponse, institutionsResponse, programsResponse] = await Promise.all([
          axios.get('/api/courses'),
          axios.get('/api/institutions'),
          axios.get('/api/programs?filter=user'),
        ]);

        const courses = coursesResponse.data?.data || [];
        const institutions = institutionsResponse.data?.data || [];
        const userInstitutions = institutions.filter((inst: { user_id?: string | null }) => Boolean(inst.user_id));
        const programs = programsResponse.data?.data || [];

        if (courses.length === 0 || userInstitutions.length === 0 || programs.length === 0) {
          const message = 'Please add at least one institution, one course, and one program before creating a scenario.';
          setError(message);
          showToast(message, 'error');
          return;
        }
      }

      const scenarioData = {
        name: data.name,
        program_id: data.program_id,
        description: data.description || null,
      };

      if (scenario) {
        await axios.put(`/api/scenarios/${scenario.id}`, scenarioData);
        showToast('Scenario updated successfully', 'success');
      } else {
        await axios.post('/api/scenarios', scenarioData);
        showToast('Scenario created successfully', 'success');
      }

      reset();
      router.refresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred');
        showToast(err.response?.data?.error || 'An error occurred', 'error');
      } else {
        setError('An error occurred');
        showToast('An error occurred', 'error');
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
      aria-labelledby="scenario-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="scenario-modal-title">
            {scenario ? 'Edit Scenario' : 'Create Scenario'}
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
          aria-label={scenario ? 'Edit scenario form' : 'Create scenario form'}
        >
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Scenario Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Graduate in 3 years"
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
            <label htmlFor="program_id" className={styles.label}>
              Program <span aria-hidden="true">*</span>
            </label>
            <select
              id="program_id"
              {...register('program_id')}
              className={styles.select}
              aria-required="true"
              aria-invalid={errors.program_id ? 'true' : 'false'}
              aria-describedby={errors.program_id ? 'program_id-error' : undefined}
            >
              <option value="">Select a program</option>
              {userPrograms.length > 0 && (
                <optgroup label="Your Programs">
                  {userPrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {process.env.NEXT_PUBLIC_ENABLE_OFFICIAL_PROGRAMS === 'true' && (
                officialPrograms.length > 0 && (
                  <optgroup label="Official Programs">
                    {officialPrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>
            {errors.program_id && (
              <span className={styles.fieldError} id="program_id-error" role="alert">
                {errors.program_id.message}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              className={styles.textarea}
              rows={4}
              placeholder="Describe your what-if scenario..."
              aria-label="Scenario description"
            />
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
              {isSubmitting ? 'Saving...' : scenario ? 'Update' : 'Create Scenario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
