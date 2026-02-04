'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import type { ProgramModalProps } from '@/types/modal';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/modals/CourseModal.module.scss';

interface Institution {
  id: string;
  name: string;
  short_code: string | null;
  country: string | null;
  status: string;
  is_official: boolean;
  logo_url: string | null;
}

const programSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  institution_id: z.string().optional(),
  min_prereq_gpa: z.number().min(0).max(4).optional().nullable(),
  min_overall_gpa: z.number().min(0).max(4).optional().nullable(),
});

type ProgramFormData = z.infer<typeof programSchema>;

const customInstitutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required'),
  short_code: z.string().min(1, 'Short code is required'),
  country: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CustomInstitutionFormData = z.infer<typeof customInstitutionSchema>;

interface ExtendedProgramModalProps extends ProgramModalProps {
  userInstitutions: Institution[];
  allInstitutions: Institution[];
}

export default function ProgramModal({ isOpen, onClose, program, userInstitutions, allInstitutions }: ExtendedProgramModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomInstitution, setShowCustomInstitution] = useState(false);
  const [isCreatingInstitution, setIsCreatingInstitution] = useState(false);
  const [localUserInstitutions, setLocalUserInstitutions] = useState<Institution[]>(userInstitutions);
  const [localAllInstitutions, setLocalAllInstitutions] = useState<Institution[]>(allInstitutions);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    setValue,
    watch,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: program ? {
      name: program.name,
      institution_id: program.institution_id || '',
      min_prereq_gpa: program.min_prereq_gpa,
      min_overall_gpa: program.min_overall_gpa,
    } : {
      institution_id: '',
    },
  });

  const {
    register: registerCustomInst,
    handleSubmit: handleCustomInstSubmit,
    formState: { errors: customInstErrors },
    reset: resetCustomInst,
  } = useForm<CustomInstitutionFormData>({
    resolver: zodResolver(customInstitutionSchema),
  });

  const selectedInstitutionId = watch('institution_id');

  useEffect(() => {
    if (!isOpen) return;
    setLocalUserInstitutions(userInstitutions);
    setLocalAllInstitutions(allInstitutions);
  }, [isOpen, userInstitutions, allInstitutions]);

  const onSubmitCustomInstitution = async (data: CustomInstitutionFormData) => {
    setIsCreatingInstitution(true);
    setError(null);

    const currentValues = getValues();

    try {
      const institutionData = {
        name: data.name,
        short_code: data.short_code,
        country: data.country || null,
        website: data.website || null,
      };

      const response = await axios.post('/api/institutions', institutionData);
      const newInstitutionId = response.data.id;
      const newInstitution: Institution = {
        id: newInstitutionId,
        name: institutionData.name,
        short_code: institutionData.short_code,
        country: institutionData.country,
        status: 'pending',
        is_official: false,
        logo_url: null,
      };

      setLocalUserInstitutions((prev) => [...prev, newInstitution]);
      setLocalAllInstitutions((prev) => {
        if (prev.some((inst) => inst.id === newInstitutionId)) {
          return prev;
        }
        return [...prev, newInstitution];
      });

      showToast('Institution created successfully', 'success');
      
      // Set the newly created institution as selected
      const nextValues = {
        ...currentValues,
        institution_id: newInstitutionId,
      };
      reset(nextValues, { keepErrors: true, keepTouched: true, keepDirty: true });
      
      // Hide the custom institution form
      setShowCustomInstitution(false);
      resetCustomInst();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create institution');
        showToast(err.response?.data?.error || 'Failed to create institution', 'error');
      } else {
        setError('An error occurred');
        showToast('An error occurred', 'error');
      }
    } finally {
      setIsCreatingInstitution(false);
    }
  };

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const programData = {
        name: data.name,
        institution_id: data.institution_id || null,
        min_prereq_gpa: data.min_prereq_gpa || null,
        min_overall_gpa: data.min_overall_gpa || null,
      };

      if (program) {
        await axios.put(`/api/programs/${program.id}`, programData);
        showToast('Program updated successfully', 'success');
      } else {
        await axios.post('/api/programs', programData);
        showToast('Program created successfully', 'success');

        try {
          const onboardingResponse = await axios.get('/api/onboarding');
          const onboarding = onboardingResponse.data?.data;

          if (
            onboarding &&
            !onboarding.onboarding_completed &&
            onboarding.current_step === 'programs' &&
            !onboarding.steps_completed?.includes('programs')
          ) {
            const updatedSteps = [...(onboarding.steps_completed || []), 'programs'];
            await axios.put('/api/onboarding', {
              step: 'scenarios',
              steps_completed: updatedSteps,
            });

            reset();
            onClose();
            router.push('/scenarios');
            router.refresh();
            return;
          }
        } catch (onboardingError) {
          console.warn('Failed to update onboarding after program creation:', onboardingError);
        }
      }

      reset();
      router.refresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred');
        showToast(err.response?.data?.error || 'Failed to save program', 'error');
      } else {
        setError('An error occurred');
        showToast('An error occurred', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      setError('Please enter a valid website URL.');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const response = await axios.post('/api/programs/import', {
        url: importUrl.trim(),
      });

      showToast(
        `Imported program "${response.data?.programName || 'Program'}" successfully`,
        'success'
      );
      setImportUrl('');
      reset();
      router.refresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to import program');
        showToast(err.response?.data?.error || 'Failed to import program', 'error');
      } else {
        setError('Failed to import program');
        showToast('Failed to import program', 'error');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    reset();
    resetCustomInst();
    setError(null);
    setShowCustomInstitution(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="program-modal-title">
            {program ? 'Edit Program' : 'Add Program'}
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
          aria-label={program ? 'Edit program form' : 'Add program form'}
        >
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {!program && (
            <div className={styles.importSection}>
              <h3 className={styles.importTitle}>Import from program page</h3>
              <p className={styles.importSubtitle}>
                Paste a school program link and we’ll extract the institution, program details, and prerequisites.
              </p>
              <div className={styles.importRow}>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(event) => setImportUrl(event.target.value)}
                  className={styles.input}
                  placeholder="https://www.university.edu/programs/nursing"
                  aria-label="Program webpage URL"
                />
                <button
                  type="button"
                  onClick={handleImportFromUrl}
                  className={styles.importButton}
                  disabled={isImporting}
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
              <div className={styles.importDivider}>or enter details manually</div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Program Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={styles.input}
              placeholder="e.g., Computer Science Major"
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

          <div className={styles.formGroup}>
            <label htmlFor="institution_id" className={styles.label}>
              Institution
            </label>
            <select
              id="institution_id"
              {...register('institution_id')}
              className={styles.input}
              onChange={(e) => {
                setValue('institution_id', e.target.value);
                if (e.target.value) {
                  setShowCustomInstitution(false);
                }
              }}
            >
              <option value="">Select an institution</option>
              
              {localUserInstitutions.length > 0 && (
                <optgroup label="Your Institutions">
                  {localUserInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </optgroup>
              )}
              
              {process.env.NEXT_ENABLE_OFFICIAL_INSTITUTIONS === 'true' && localAllInstitutions.length > 0 && (
                <optgroup label="Available Institutions">
                  {localAllInstitutions
                    .filter(inst => !localUserInstitutions.some(ui => ui.id === inst.id))
                    .map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            
            {!selectedInstitutionId && !showCustomInstitution && (
              <button
                type="button"
                onClick={() => setShowCustomInstitution(true)}
                className={styles.linkButton}
                style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#0066cc', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
              >
                + Create custom institution
              </button>
            )}
            
            {showCustomInstitution && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    Create Custom Institution
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInstitution(false);
                      resetCustomInst();
                      setError(null);
                    }}
                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#666' }}
                    aria-label="Cancel custom institution"
                  >
                    ×
                  </button>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="custom_inst_name" className={styles.label}>
                    Institution Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="custom_inst_name"
                    type="text"
                    {...registerCustomInst('name')}
                    className={styles.input}
                    placeholder="e.g., University of California, Berkeley"
                  />
                  {customInstErrors.name && (
                    <span className={styles.fieldError}>{customInstErrors.name.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="custom_inst_short_code" className={styles.label}>
                    Short Code <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="custom_inst_short_code"
                    type="text"
                    {...registerCustomInst('short_code')}
                    className={styles.input}
                    placeholder="e.g., UCB"
                  />
                  {customInstErrors.short_code && (
                    <span className={styles.fieldError}>{customInstErrors.short_code.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="custom_inst_country" className={styles.label}>
                    Country
                  </label>
                  <input
                    id="custom_inst_country"
                    type="text"
                    {...registerCustomInst('country')}
                    className={styles.input}
                    placeholder="e.g., USA"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="custom_inst_website" className={styles.label}>
                    Website
                  </label>
                  <input
                    id="custom_inst_website"
                    type="text"
                    {...registerCustomInst('website')}
                    className={styles.input}
                    placeholder="e.g., https://www.berkeley.edu"
                  />
                  {customInstErrors.website && (
                    <span className={styles.fieldError}>{customInstErrors.website.message}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCustomInstSubmit(onSubmitCustomInstitution)}
                  disabled={isCreatingInstitution}
                  className={styles.submitButton}
                  style={{ width: '100%' }}
                >
                  {isCreatingInstitution ? 'Creating...' : 'Create Institution'}
                </button>
              </div>
            )}
            
            {!showCustomInstitution && (
              <p className={styles.helperText}>
                Select an institution from the list or create a custom one
              </p>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="min_prereq_gpa" className={styles.label}>
                Min Prerequisite GPA
              </label>
              <input
                id="min_prereq_gpa"
                type="number"
                step="0.01"
                {...register('min_prereq_gpa', { valueAsNumber: true })}
                className={styles.input}
                placeholder="0.00 - 4.00"
              />
              {errors.min_prereq_gpa && (
                <span className={styles.fieldError}>{errors.min_prereq_gpa.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="min_overall_gpa" className={styles.label}>
                Min Overall GPA
              </label>
              <input
                id="min_overall_gpa"
                type="number"
                step="0.01"
                {...register('min_overall_gpa', { valueAsNumber: true })}
                className={styles.input}
                placeholder="0.00 - 4.00"
              />
              {errors.min_overall_gpa && (
                <span className={styles.fieldError}>{errors.min_overall_gpa.message}</span>
              )}
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
              {isSubmitting ? 'Saving...' : program ? 'Update' : 'Add Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
