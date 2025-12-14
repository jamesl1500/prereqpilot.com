'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Lock, Globe, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/modules/pages/institution-signup.module.scss';

interface FormData {
  institutionName: string;
  domain: string;
  contactEmail: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  website: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function InstitutionSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    institutionName: '',
    domain: '',
    contactEmail: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    website: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    if (step === 1) {
      if (!formData.institutionName.trim()) {
        setError('Institution name is required');
        return false;
      }
      if (!formData.domain.trim()) {
        setError('Institution email domain is required');
        return false;
      }
      if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
        setError('Valid contact email is required');
        return false;
      }
      // Validate that contact email matches domain
      const emailDomain = formData.contactEmail.split('@')[1];
      if (emailDomain !== formData.domain) {
        setError(`Contact email must be from the domain @${formData.domain}`);
        return false;
      }
    }

    if (step === 2) {
      if (!formData.adminName.trim()) {
        setError('Administrator name is required');
        return false;
      }
      if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
        setError('Valid administrator email is required');
        return false;
      }
      // Validate that admin email matches domain
      const emailDomain = formData.adminEmail.split('@')[1];
      if (emailDomain !== formData.domain) {
        setError(`Administrator email must be from the domain @${formData.domain}`);
        return false;
      }
      if (!formData.adminPassword || formData.adminPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (formData.adminPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/institution/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionName: formData.institutionName,
          domain: formData.domain,
          contactEmail: formData.contactEmail,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          website: formData.website || null,
          description: formData.description || null,
          address: {
            street: formData.street || null,
            city: formData.city || null,
            state: formData.state || null,
            zip: formData.zip || null,
            country: formData.country || null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register institution');
      }

      // Redirect to pending verification page
      router.push('/institution/pending');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <div className={styles.iconWrapper}>
              <Building2 size={40} />
            </div>
            <h1 className={styles.title}>Register Your Institution</h1>
            <p className={styles.subtitle}>
              Join PrereqPilot to manage your programs and connect with prospective students
            </p>
          </div>

          {/* Progress Steps */}
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepLabel}>Institution Info</div>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepLabel}>Administrator Account</div>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepLabel}>Additional Details</div>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Step 1: Institution Information */}
            {currentStep === 1 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Institution Information</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="institutionName">
                    <Building2 size={16} />
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => updateFormData('institutionName', e.target.value)}
                    placeholder="e.g., University of California, Berkeley"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="domain">
                    <Mail size={16} />
                    Official Email Domain *
                  </label>
                  <div className={styles.domainInput}>
                    <span className={styles.domainPrefix}>@</span>
                    <input
                      type="text"
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => updateFormData('domain', e.target.value)}
                      placeholder="berkeley.edu"
                      required
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    Enter your institution's email domain for verification
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contactEmail">
                    <Mail size={16} />
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData('contactEmail', e.target.value)}
                    placeholder={`admin@${formData.domain || 'yourdomain.edu'}`}
                    required
                  />
                  <span className={styles.fieldHint}>
                    Must be from your institution's domain
                  </span>
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={handleNext} className={styles.nextButton}>
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Administrator Account */}
            {currentStep === 2 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Administrator Account</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="adminName">
                    <User size={16} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => updateFormData('adminName', e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="adminEmail">
                    <Mail size={16} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    value={formData.adminEmail}
                    onChange={(e) => updateFormData('adminEmail', e.target.value)}
                    placeholder={`admin@${formData.domain || 'yourdomain.edu'}`}
                    required
                  />
                  <span className={styles.fieldHint}>
                    Must be from @{formData.domain || 'yourdomain.edu'}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="adminPassword">
                    <Lock size={16} />
                    Password *
                  </label>
                  <input
                    type="password"
                    id="adminPassword"
                    value={formData.adminPassword}
                    onChange={(e) => updateFormData('adminPassword', e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">
                    <Lock size={16} />
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={handleBack} className={styles.backButton}>
                    Back
                  </button>
                  <button type="button" onClick={handleNext} className={styles.nextButton}>
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Additional Details */}
            {currentStep === 3 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Additional Details (Optional)</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="website">
                    <Globe size={16} />
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="https://www.berkeley.edu"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Brief description of your institution..."
                    rows={4}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <MapPin size={16} />
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateFormData('street', e.target.value)}
                    placeholder="Street Address"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      placeholder="State/Province"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateFormData('zip', e.target.value)}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={handleBack} className={styles.backButton}>
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className={styles.loginLink}>
            Already registered? <Link href="/login">Sign in</Link>
          </div>
        </div>

        <div className={styles.infoPanel}>
          <h2>Benefits of Joining PrereqPilot</h2>
          <ul>
            <li>
              <strong>Reach More Students</strong>
              <p>Connect with students actively searching for programs that match their qualifications</p>
            </li>
            <li>
              <strong>Streamline Admissions</strong>
              <p>Automated prerequisite checking saves time for both staff and applicants</p>
            </li>
            <li>
              <strong>Manage Your Catalog</strong>
              <p>Centralized platform for course catalogs and program requirements</p>
            </li>
            <li>
              <strong>Data-Driven Insights</strong>
              <p>Analytics on application trends and student interest</p>
            </li>
          </ul>

          <div className={styles.verificationNote}>
            <h3>Verification Process</h3>
            <ol>
              <li>Submit registration with institutional email</li>
              <li>Email verification link sent to your inbox</li>
              <li>Admin review (typically 1-2 business days)</li>
              <li>Account approved - start managing programs!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
