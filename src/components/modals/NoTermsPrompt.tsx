'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { NoTermsPromptProps } from '@/types/modal';
import styles from '@/styles/modules/modals/NoTermsPrompt.module.scss';

export default function NoTermsPrompt({ isOpen, onClose, onCreateTerm }: NoTermsPromptProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}><Calendar size={64} strokeWidth={2} /></div>
        <h2 className={styles.title}>Terms Required</h2>
        <p className={styles.message}>
          Before adding courses, you need to create at least one term (semester).
          Terms help organize your courses by academic period.
        </p>
        <p className={styles.example}>
          Examples: Fall 2024, Spring 2025, Summer 2025
        </p>
        <div className={styles.actions}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={onCreateTerm}
            className={styles.createButton}
          >
            Create Your First Term
          </button>
        </div>
      </div>
    </div>
  );
}
