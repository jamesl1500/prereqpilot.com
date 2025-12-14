'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import type { ScenarioModalProps } from '@/types/modal';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  description: z.string().optional(),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

export default function ScenarioModal({ isOpen, onClose, scenario }: ScenarioModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: scenario ? {
      name: scenario.name,
      description: scenario.description || '',
    } : undefined,
  });

  const onSubmit = async (data: ScenarioFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const scenarioData = {
        name: data.name,
        description: data.description || null,
      };

      if (scenario) {
        await axios.put(`/api/scenarios/${scenario.id}`, scenarioData);
      } else {
        await axios.post('/api/scenarios', scenarioData);
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
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {scenario ? 'Edit Scenario' : 'Create Scenario'}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Scenario Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Graduate in 3 years"
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
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
