'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import type { DeleteModalProps } from '@/types/modal';
import styles from '@/styles/modules/modals/DeleteModal.module.scss';

export default function DeleteModal({ isOpen, onClose, itemType, itemId, itemName }: DeleteModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiEndpoint = () => {
    switch (itemType) {
      case 'course':
        return `/api/courses/${itemId}`;
      case 'institution':
        return `/api/institutions/${itemId}`;
      case 'program':
        return `/api/programs/${itemId}`;
      case 'scenario':
        return `/api/scenarios/${itemId}`;
      case 'term':
        return `/api/terms/${itemId}`;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const endpoint = getApiEndpoint();
      await axios.delete(endpoint);

      router.refresh();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="delete-modal-title">
            Delete {itemType}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          
          <p className={styles.message} id="delete-modal-description">
            Are you sure you want to delete <strong>{itemName}</strong>?
          </p>
          <p className={styles.warning} role="alert">
            This action cannot be undone.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={isDeleting}
            aria-busy={isDeleting ? 'true' : 'false'}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
