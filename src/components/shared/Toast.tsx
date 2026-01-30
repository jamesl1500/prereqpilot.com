'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import styles from '@/styles/modules/components/toast.module.scss';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check size={20} strokeWidth={2.5} />;
      case 'error':
        return <X size={20} strokeWidth={2.5} />;
      case 'warning':
        return <AlertCircle size={20} strokeWidth={2.5} />;
      case 'info':
        return <Info size={20} strokeWidth={2.5} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            role="alert"
            aria-live="polite"
          >
            <div className={styles.iconWrapper}>
              {getIcon(toast.type)}
            </div>
            <span className={styles.message}>{toast.message}</span>
            <button
              className={styles.closeButton}
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
