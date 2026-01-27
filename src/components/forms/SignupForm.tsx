'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { signupSchema, type SignupFormData } from '@/lib/schemas/auth.schema';
import styles from '@/styles/modules/components/AuthForm.module.scss';

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function SignupForm({ onSubmit, isLoading, error }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  return (
    <div className={styles.formWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Create an account</h2>
        <p className={styles.subtitle}>Start planning your academic journey today</p>
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className={styles.form}
        aria-label="Sign up form"
        noValidate
      >
        {error && (
          <div 
            className={styles.error}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="John Doe"
            autoComplete="name"
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p className={styles.errorText} id="name-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email address <span aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="you@example.com"
            autoComplete="email"
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p className={styles.errorText} id="email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password <span aria-hidden="true">*</span>
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
            Confirm password <span aria-hidden="true">*</span>
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
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
