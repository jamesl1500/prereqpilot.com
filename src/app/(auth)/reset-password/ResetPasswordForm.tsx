'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/auth.schema';
import styles from '@/styles/modules/components/AuthForm.module.scss';

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function ResetPasswordForm({ onSubmit, isLoading, error }: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  return (
    <div className={styles.formWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Reset your password</h2>
        <p className={styles.subtitle}>Enter your new password below</p>
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className={styles.form}
        aria-label="Reset password form"
        noValidate
      >
        {error && (
          <div className={styles.error} role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            New password <span aria-hidden="true">*</span>
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-required="true"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
          />
          {errors.password && (
            <p className={styles.errorText} id="password-error" role="alert">
              {errors.password.message}
            </p>
          )}
          {!errors.password && (
            <p className={styles.hint} id="password-hint">
              Must contain uppercase, lowercase, and a number
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm new password <span aria-hidden="true">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-required="true"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <p className={styles.errorText} id="confirmPassword-error" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
          aria-busy={isLoading ? 'true' : 'false'}
        >
          {isLoading ? 'Updating password...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
