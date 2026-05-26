'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types/institution';
import { Building2, Mail, Globe, MapPin, FileText, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/institution-profile.module.scss';

const institutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required'),
  short_code: z.string().min(1, 'Short code is required'),
  description: z.string().optional(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  domain: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

type InstitutionFormData = z.infer<typeof institutionSchema>;

interface InstitutionProfilePageProps {
  user: User;
  institution: Institution;
  stats: {
    programCount: number;
    courseCount: number;
  };
}

export default function InstitutionProfilePage({ user, institution, stats }: InstitutionProfilePageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: institution.name,
      short_code: institution.short_code,
      description: institution.description || '',
      website_url: institution.website_url || '',
      contact_email: institution.contact_email || '',
      domain: institution.domain || '',
      street: institution.address?.street || '',
      city: institution.address?.city || '',
      state: institution.address?.state || '',
      zip: institution.address?.zip || '',
      country: institution.address?.country || '',
    },
  });

  const onSubmit = async (data: InstitutionFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/institutions/${institution.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          short_code: data.short_code,
          description: data.description || null,
          website_url: data.website_url || null,
          contact_email: data.contact_email || null,
          domain: data.domain || null,
          address: {
            street: data.street || null,
            city: data.city || null,
            state: data.state || null,
            zip: data.zip || null,
            country: data.country || null,
          },
        }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to update profile');
      }
      setSuccessMessage('Profile updated successfully!');
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred while updating the profile';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <Building2 size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Institution Profile</h1>
            <p className={styles.subtitle}>Manage your institution's information</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.programCount}</div>
            <div className={styles.statLabel}>Programs</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.courseCount}</div>
            <div className={styles.statLabel}>Courses</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            {institution.status === 'verified' ? <Check size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {institution.status === 'verified' ? 'Verified' : 'Pending'}
            </div>
            <div className={styles.statLabel}>Status</div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className={styles.successBox}>
          <Check size={20} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Institution Name *
              </label>
              <input
                id="name"
                type="text"
                className={styles.input}
                {...register('name')}
                placeholder="e.g., University of California"
              />
              {errors.name && (
                <span className={styles.fieldError}>{errors.name.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="short_code" className={styles.label}>
                Short Code *
              </label>
              <input
                id="short_code"
                type="text"
                className={styles.input}
                {...register('short_code')}
                placeholder="e.g., UCLA"
              />
              {errors.short_code && (
                <span className={styles.fieldError}>{errors.short_code.message}</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                className={styles.textarea}
                {...register('description')}
                placeholder="Brief description of your institution..."
                rows={4}
              />
              {errors.description && (
                <span className={styles.fieldError}>{errors.description.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Mail size={24} />
            Contact Information
          </h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="contact_email" className={styles.label}>
                Contact Email
              </label>
              <input
                id="contact_email"
                type="email"
                className={styles.input}
                {...register('contact_email')}
                placeholder="e.g., admissions@university.edu"
              />
              {errors.contact_email && (
                <span className={styles.fieldError}>{errors.contact_email.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="website_url" className={styles.label}>
                Website URL
              </label>
              <div className={styles.inputWithIcon}>
                <Globe size={20} />
                <input
                  id="website_url"
                  type="url"
                  className={styles.input}
                  {...register('website_url')}
                  placeholder="e.g., https://www.university.edu"
                />
              </div>
              {errors.website_url && (
                <span className={styles.fieldError}>{errors.website_url.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="domain" className={styles.label}>
                Email Domain
              </label>
              <input
                id="domain"
                type="text"
                className={styles.input}
                {...register('domain')}
                placeholder="e.g., university.edu"
              />
              <small className={styles.fieldHint}>
                Used for email verification and authentication
              </small>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MapPin size={24} />
            Address
          </h2>
          
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="street" className={styles.label}>
                Street Address
              </label>
              <input
                id="street"
                type="text"
                className={styles.input}
                {...register('street')}
                placeholder="e.g., 123 University Ave"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>
                City
              </label>
              <input
                id="city"
                type="text"
                className={styles.input}
                {...register('city')}
                placeholder="e.g., Los Angeles"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state" className={styles.label}>
                State/Province
              </label>
              <input
                id="state"
                type="text"
                className={styles.input}
                {...register('state')}
                placeholder="e.g., CA"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="zip" className={styles.label}>
                ZIP/Postal Code
              </label>
              <input
                id="zip"
                type="text"
                className={styles.input}
                {...register('zip')}
                placeholder="e.g., 90095"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="country" className={styles.label}>
                Country
              </label>
              <input
                id="country"
                type="text"
                className={styles.input}
                {...register('country')}
                placeholder="e.g., United States"
              />
            </div>
          </div>
        </div>

        {/* Admin Information */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Administrator</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>
                {user.user_metadata?.name || 'Not specified'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
