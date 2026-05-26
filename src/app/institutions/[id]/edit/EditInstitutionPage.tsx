'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Institution } from '@/types';
import { User } from '@supabase/supabase-js';
import styles from '@/styles/modules/pages/edit-institution.module.scss';
import { ArrowLeft, Building2, Globe, Check } from 'lucide-react';

const institutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required'),
  short_code: z.string().min(1, 'Short code is required').max(10, 'Short code must be 10 characters or less'),
  country: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

interface EditInstitutionPageProps {
  user: User;
  institution: Institution;
}

export default function EditInstitutionPage({ user, institution }: EditInstitutionPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: institution.name,
      short_code: institution.short_code,
      country: institution.country || '',
      website: institution.website || '',
    },
  });

  const onSubmit = async (data: InstitutionFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const institutionData = {
        name: data.name,
        short_code: data.short_code,
        country: data.country || null,
        website: data.website || null,
      };

      const response = await fetch(`/api/institutions/${institution.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(institutionData),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'An error occurred while updating the institution');
      }
      setSuccessMessage('Institution updated successfully!');
      setTimeout(() => {
        router.push(`/institutions/${institution.id}`);
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the institution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/institutions/${institution.id}`);
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        {/* Back Button */}
        <button 
          onClick={() => router.push('/institutions')} 
          className={styles.backButton}
        >
          <ArrowLeft size={20} strokeWidth={2} />
          Back to Institutions
        </button>

        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <Building2 size={48} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={styles.title}>Edit Institution</h1>
              <p className={styles.subtitle}>
                Update the details of {institution.name}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {error && (
              <div className={styles.errorBox}>
                <p>{error}</p>
              </div>
            )}

            {successMessage && (
              <div className={styles.successBox}>
                <Check size={20} strokeWidth={2} />
                <p>{successMessage}</p>
              </div>
            )}

            {/* Institution Name */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Institution Name *
              </label>
              <div className={styles.inputWithIcon}>
                <Building2 size={18} strokeWidth={2} />
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={styles.input}
                  placeholder="e.g., Community College of San Francisco"
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && (
                <span className={styles.fieldError}>{errors.name.message}</span>
              )}
              <span className={styles.fieldHint}>
                Enter the full official name of the institution
              </span>
            </div>

            {/* Short Code */}
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

            {/* Country and Website Row */}
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
                  <Globe size={18} strokeWidth={2} />
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

            {/* Actions */}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}