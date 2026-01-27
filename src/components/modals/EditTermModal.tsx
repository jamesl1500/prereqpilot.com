'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { TermType, CreatePlanTermData } from '@/types/plan';
import styles from '@/styles/modules/modals/EditTermModal.module.scss';

interface EditTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: {
    id: string;
    name: string;
    term_type?: TermType;
    year?: number;
    credits_target?: number;
    notes?: string;
  };
  onUpdate: (termId: string, updates: Partial<CreatePlanTermData>) => Promise<void>;
}

const TERM_TYPES: TermType[] = ['Fall', 'Spring', 'Summer', 'Winter', 'Session'];

export default function EditTermModal({ isOpen, onClose, term, onUpdate }: EditTermModalProps) {
  const [termName, setTermName] = useState('');
  const [termType, setTermType] = useState<TermType>('Fall');
  const [termYear, setTermYear] = useState(new Date().getFullYear());
  const [creditsTarget, setCreditsTarget] = useState<number>(15);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && term) {
      setTermName(term.name || '');
      setTermType(term.term_type || 'Fall');
      setTermYear(term.year || new Date().getFullYear());
      setCreditsTarget(term.credits_target || 15);
      setNotes(term.notes || '');
      setError('');
    }
  }, [isOpen, term]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termName.trim()) {
      setError('Term name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onUpdate(term.id, {
        name: termName,
        term_type: termType,
        year: termYear,
        credits_target: creditsTarget,
        notes: notes || undefined,
      });
      onClose();
    } catch (err) {
      setError('Failed to update term. Please try again.');
      console.error('Error updating term:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-term-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="edit-term-modal-title">
            Edit Term
          </h2>
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Close modal"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className={styles.form}
          aria-label="Edit term form"
        >
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="termName" className={styles.label}>
              Term Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="termName"
              type="text"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              className={styles.input}
              placeholder="e.g., Fall 2024"
              required
              aria-required="true"
              aria-invalid={!termName.trim() ? 'true' : 'false'}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="termType" className={styles.label}>
                Term Type
              </label>
              <select
                id="termType"
                value={termType}
                onChange={(e) => setTermType(e.target.value as TermType)}
                className={styles.select}
              >
                {TERM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="termYear" className={styles.label}>
                Year
              </label>
              <input
                id="termYear"
                type="number"
                value={termYear}
                onChange={(e) => setTermYear(parseInt(e.target.value))}
                className={styles.input}
                min={2000}
                max={2100}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="creditsTarget" className={styles.label}>
              Credits Target
            </label>
            <input
              id="creditsTarget"
              type="number"
              value={creditsTarget}
              onChange={(e) => setCreditsTarget(parseFloat(e.target.value))}
              className={styles.input}
              min={0}
              max={30}
              step={0.5}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              placeholder="Add any notes about this term..."
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
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
              {isSubmitting ? 'Updating...' : 'Update Term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
