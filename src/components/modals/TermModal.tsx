'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

import type { TermModalProps } from '@/types/modal';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

const termSchema = z.object({
  name: z.string().min(1, 'Term name is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type TermFormData = z.infer<typeof termSchema>;

function toInputDate(value?: string | null): string {
  if (!value) return '';
  // Normalize potential ISO/date strings to input[type="date"] format YYYY-MM-DD
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function TermModal({ isOpen, onClose, term }: TermModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TermFormData>({
    resolver: zodResolver(termSchema),
    defaultValues: term
      ? {
          name: term.name ?? '',
          start_date: toInputDate(term.start_date),
          end_date: toInputDate(term.end_date),
        }
      : {
          name: '',
          start_date: '',
          end_date: '',
        },
  });

  // Ensure form fields populate when opening in edit mode or when term changes
  useEffect(() => {
    if (!isOpen) return;
    if (term) {
      reset({
        name: term.name ?? '',
        start_date: toInputDate(term.start_date),
        end_date: toInputDate(term.end_date),
      });
    } else {
      reset({ name: '', start_date: '', end_date: '' });
    }
  }, [term, isOpen, reset]);

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
        showToast('Term updated successfully', 'success');
      } else {
        await axios.post('/api/terms', termData);
        showToast('Term created successfully', 'success');
      }

      reset();
      router.refresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred');
        showToast(err.response?.data?.error || 'Failed to save term', 'error');
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
      aria-labelledby="term-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="term-modal-title">
            {term ? 'Edit Term' : 'Add Term'}
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
          aria-label={term ? 'Edit term form' : 'Add term form'}
        >
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Term Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Fall 2024, Spring 2025"
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
