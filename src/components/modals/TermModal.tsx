'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

import type { TermModalProps } from '@/types/modal';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

const termSchema = z.object({
  name: z.string().min(1, 'Term name is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type TermFormData = z.infer<typeof termSchema>;

export default function TermModal({ isOpen, onClose, term }: TermModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TermFormData>({
    resolver: zodResolver(termSchema),
    defaultValues: term ? {
      name: term.name,
      start_date: term.start_date || '',
      end_date: term.end_date || '',
    } : undefined,
  });

  const onSubmit = async (data: TermFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const termData = {
        name: data.name,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };

      if (term) {
        await axios.put(`/api/terms/${term.id}`, termData);
      } else {
        await axios.post('/api/terms', termData);
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
            {term ? 'Edit Term' : 'Add Term'}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Term Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Fall 2024, Spring 2025"
              value={term ? term.name : ""}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_date" className={styles.label}>
                Start Date
              </label>
              <input
                id="start_date"
                type="date"
                {...register('start_date')}
                className={styles.input}
                value={term ? term.start_date || "" : ""}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="end_date" className={styles.label}>
                End Date
              </label>
              <input
                id="end_date"
                type="date"
                {...register('end_date')}
                className={styles.input}
                value={term ? term.end_date || "" : ""}
              />
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
              {isSubmitting ? 'Saving...' : term ? 'Update' : 'Add Term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
