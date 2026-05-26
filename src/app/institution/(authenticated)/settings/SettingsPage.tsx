'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { Settings, User as UserIcon, Lock, Mail, Check, AlertCircle } from 'lucide-react';
import styles from '@/styles/modules/pages/institution-settings.module.scss';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const deleteAccountSchema = z.object({
    confirmation: z.literal('DELETE').refine((val) => val === 'DELETE', {
        message: 'You must type DELETE to confirm',
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

interface SettingsPageProps {
  user: User;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.user_metadata?.name || '',
      email: user.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const {
    register: registerDelete,
    handleSubmit: handleSubmitDelete,
    formState: { errors: deleteErrors },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to update profile');
      }
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to update password');
      }
      setSuccessMessage('Password updated successfully!');
      resetPassword();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <Settings size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Account Settings</h1>
            <p className={styles.subtitle}>Manage your personal information and security</p>
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

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('profile');
            setError(null);
            setSuccessMessage(null);
          }}
        >
          <UserIcon size={18} />
          Profile
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'password' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('password');
            setError(null);
            setSuccessMessage(null);
          }}
        >
          <Lock size={18} />
          Password
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'delete' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('delete');
            setError(null);
            setSuccessMessage(null);
          }}
        >
          <AlertCircle size={18} />
          Delete Account
        </button>
      </div>

      <div className={styles.content}>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <UserIcon size={24} />
                Personal Information
              </h2>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={styles.input}
                    {...registerProfile('name')}
                    placeholder="e.g., John Doe"
                  />
                  {profileErrors.name && (
                    <span className={styles.fieldError}>{profileErrors.name.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address *
                  </label>
                  <div className={styles.inputWithIcon}>
                    <Mail size={20} />
                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      {...registerProfile('email')}
                      placeholder="e.g., john@university.edu"
                    />
                  </div>
                  {profileErrors.email && (
                    <span className={styles.fieldError}>{profileErrors.email.message}</span>
                  )}
                  <small className={styles.fieldHint}>
                    Changing your email will require verification
                  </small>
                </div>
              </div>

              <div className={styles.infoBox}>
                <AlertCircle size={20} />
                <div>
                  <strong>Account Type:</strong> Institution Administrator
                  <br />
                  <strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || !isProfileDirty}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Lock size={24} />
                Change Password
              </h2>

              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="currentPassword" className={styles.label}>
                    Current Password *
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className={styles.input}
                    {...registerPassword('currentPassword')}
                    placeholder="Enter your current password"
                  />
                  {passwordErrors.currentPassword && (
                    <span className={styles.fieldError}>{passwordErrors.currentPassword.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    New Password *
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className={styles.input}
                    {...registerPassword('newPassword')}
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <span className={styles.fieldError}>{passwordErrors.newPassword.message}</span>
                  )}
                  <small className={styles.fieldHint}>
                    Must be at least 8 characters
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className={styles.input}
                    {...registerPassword('confirmPassword')}
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <span className={styles.fieldError}>{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>
              </div>

              <div className={styles.infoBox}>
                <AlertCircle size={20} />
                <div>
                  <strong>Password Requirements:</strong>
                  <ul className={styles.requirementsList}>
                    <li>At least 8 characters long</li>
                    <li>Mix of uppercase and lowercase letters recommended</li>
                    <li>Include numbers and special characters for better security</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* Delete Account Tab */}
        {activeTab === 'delete' && (
          <form onSubmit={handleSubmitDelete(() => {})} className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <AlertCircle size={24} />
                Delete Account
              </h2>

              <div className={styles.formGroup}>
                <label htmlFor="confirmation" className={styles.label}>
                  Type "DELETE" to confirm *
                </label>
                <input
                  id="confirmation"
                  type="text"
                  className={styles.input}
                  {...registerDelete('confirmation')}
                  placeholder='Type "DELETE" here'
                />
                {deleteErrors.confirmation && (
                  <span className={styles.fieldError}>{deleteErrors.confirmation.message}</span>
                )}
              </div>

              <div className={styles.infoBoxDanger}>
                <AlertCircle size={20} />
                <div>
                  <strong>Warning:</strong> Deleting your account is irreversible. All your data will be permanently removed.
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButtonDanger}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
