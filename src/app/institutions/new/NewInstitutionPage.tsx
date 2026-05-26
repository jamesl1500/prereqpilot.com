'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2, Globe } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { User } from '@supabase/supabase-js';
import styles from '@/styles/modules/pages/new-institution.module.scss';

const institutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required'),
  short_code: z.string().min(1, 'Short code is required').max(10, 'Short code must be 10 characters or less'),
  country: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

interface NewInstitutionPageProps {
  user: User;
}

export default function NewInstitutionPage({ user }: NewInstitutionPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
  });

  const onSubmit = async (data: InstitutionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const institutionData = {
        name: data.name,
        short_code: data.short_code,
        country: data.country || null,
        website: data.website || null,
      };

      const postRes = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(institutionData),
      });
      if (!postRes.ok) {
        const json = await postRes.json();
        throw new Error(json.error || 'Failed to create institution');
      }

      try {
        const onboardingResponse = await fetch('/api/onboarding');
        const onboarding = onboardingResponse.ok ? (await onboardingResponse.json())?.data : null;

        if (
          onboarding &&
          !onboarding.onboarding_completed &&
          onboarding.current_step === 'institutions' &&
          !onboarding.steps_completed?.includes('institutions')
        ) {
          const updatedSteps = [...(onboarding.steps_completed || []), 'institutions'];
          await fetch('/api/onboarding', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: 'courses', steps_completed: updatedSteps }),
          });

          router.push('/classes');
          router.refresh();
          return;
        }
      } catch (onboardingError) {
        console.warn('Failed to update onboarding after institution creation:', onboardingError);
      }
      
      // Navigate back to institutions page
      router.push('/institutions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the institution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/institutions');
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleCancel}>
            <ArrowLeft size={20} />
            Back to Institutions
          </button>
          <h1 className={styles.title}>Add New Institution</h1>
          <p className={styles.subtitle}>
            Create a custom institution to track your coursework
          </p>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>
            <Building2 size={24} />
          </div>
          <div className={styles.infoContent}>
            <h3 className={styles.infoTitle}>Why add a custom institution?</h3>
            <p className={styles.infoText}>
              Add institutions where you've taken courses or plan to take courses. This helps organize 
              your transcript and track prerequisites. {!process.env.NEXT_PUBLIC_OFFICIAL_INSTITUTIONS_MESSAGE || 'Official institutions are already verified and available in the system.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Institution Name *
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={styles.input}
                placeholder="e.g., Community College of San Francisco"
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className={styles.fieldError}>{errors.name.message}</span>
              )}
              <span className={styles.fieldHint}>
                Enter the full official name of the institution
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="short_code" className={styles.label}>
                Short Code *
              </label>
              <input
                id="short_code"
                type="text"
                {...register('short_code')}
                className={styles.input}
                placeholder="e.g., CCSF"
                disabled={isSubmitting}
                maxLength={10}
              />
              {errors.short_code && (
                <span className={styles.fieldError}>{errors.short_code.message}</span>
              )}
              <span className={styles.fieldHint}>
                A short abbreviation (max 10 characters)
              </span>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.label}>
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  {...register('country')}
                  className={styles.input}
                  placeholder="e.g., United States"
                  disabled={isSubmitting}
                />
                {errors.country && (
                  <span className={styles.fieldError}>{errors.country.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website" className={styles.label}>
                  Website
                </label>
                <div className={styles.inputWithIcon}>
                  <Globe size={18} />
                  <input
                    id="website"
                    type="url"
                    {...register('website')}
                    className={styles.input}
                    placeholder="https://www.example.edu"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.website && (
                  <span className={styles.fieldError}>{errors.website.message}</span>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleCancel}
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
                {isSubmitting ? 'Creating...' : 'Create Institution'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
