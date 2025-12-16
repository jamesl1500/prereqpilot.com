'use client';

import { useState } from 'react';
import type { Term } from '@/types/term';
import styles from '@/styles/modules/modals/CourseModal.module.scss';
import manageStyles from '@/styles/modules/modals/ManageTerms.module.scss';
import { List, Plus } from 'lucide-react';

interface ManageTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTerm: () => void;
  onEditTerm: (term: Term) => void;
  onDeleteTerm: (term: Term) => void;
  terms: Term[];
}

export default function ManageTermsModal({ 
  isOpen, 
  onClose, 
  onAddTerm,
  onEditTerm,
  onDeleteTerm,
  terms 
}: ManageTermsModalProps) {
  const [view, setView] = useState<'menu' | 'list'>('menu');

  const handleClose = () => {
    setView('menu');
    onClose();
  };

  const handleViewTerms = () => {
    setView('list');
  };

  const handleAddTermClick = () => {
    handleClose();
    onAddTerm();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Terms</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        {view === 'menu' ? (
          <div className={manageStyles.menuContainer}>
            <p className={manageStyles.description}>
              Choose an action to manage your academic terms
            </p>
            
            <div className={manageStyles.buttonGroup}>
              <button 
                className={manageStyles.actionButton}
                onClick={handleViewTerms}
              >
                <span className={manageStyles.buttonIcon}><List /></span>
                <div className={manageStyles.buttonContent}>
                  <span className={manageStyles.buttonTitle}>View & Delete Terms</span>
                  <span className={manageStyles.buttonSubtitle}>
                    Manage your existing terms ({terms.length} term{terms.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </button>

              <button 
                className={manageStyles.actionButton}
                onClick={handleAddTermClick}
              >
                <span className={manageStyles.buttonIcon}><Plus /></span>
                <div className={manageStyles.buttonContent}>
                  <span className={manageStyles.buttonTitle}>Add New Term</span>
                  <span className={manageStyles.buttonSubtitle}>
                    Create a new academic term or semester
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className={manageStyles.listContainer}>
            <div className={manageStyles.listHeader}>
              <button 
                className={manageStyles.backButton}
                onClick={() => setView('menu')}
              >
                ← Back
              </button>
              <button 
                className={manageStyles.addButton}
                onClick={handleAddTermClick}
              >
                + Add Term
              </button>
            </div>

            {terms.length === 0 ? (
              <div className={manageStyles.emptyState}>
                <p>No terms created yet</p>
              </div>
            ) : (
              <div className={manageStyles.termsList}>
                {terms.map(term => (
                  <div key={term.id} className={manageStyles.termItem}>
                    <div className={manageStyles.termInfo}>
                      <h3 className={manageStyles.termName}>{term.name}</h3>
                      {(term.start_date || term.end_date) && (
                        <p className={manageStyles.termDates}>
                          {term.start_date && new Date(term.start_date).toLocaleDateString()}
                          {term.start_date && term.end_date && ' - '}
                          {term.end_date && new Date(term.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className={manageStyles.termActions}>
                      <button 
                        className={manageStyles.editButton}
                        onClick={() => {
                          handleClose();
                          onEditTerm(term);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className={manageStyles.deleteButton}
                        onClick={() => {
                          handleClose();
                          onDeleteTerm(term);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
