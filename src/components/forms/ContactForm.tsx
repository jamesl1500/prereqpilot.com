'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import styles from '@/styles/modules/pages/contact.module.scss';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

type StatusState = {
  status: FormStatus;
  message: string;
};

const initialStatus: StatusState = {
  status: 'idle',
  message: '',
};

export default function ContactForm() {
  const [statusState, setStatusState] = useState<StatusState>(initialStatus);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (statusState.status === 'sending') {
      return;
    }

    setStatusState({
      status: 'sending',
      message: 'Sending your message...'
    });

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      inquiryType: String(formData.get('inquiryType') ?? ''),
      subject: String(formData.get('subject') ?? ''),
      message: String(formData.get('message') ?? ''),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatusState({
          status: 'error',
          message: data?.error ?? 'Something went wrong. Please try again.',
        });
        return;
      }

      form.reset();
      setStatusState({
        status: 'success',
        message: 'Thanks! Your message has been sent.',
      });
    } catch {
      setStatusState({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.input}
            required
            autoComplete="name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.input}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="inquiry-type" className={styles.label}>
          Inquiry Type *
        </label>
        <select
          id="inquiry-type"
          name="inquiryType"
          className={styles.select}
          required
        >
          <option value="">Select an option</option>
          <option value="Student Support">Student Support</option>
          <option value="Institution Partnership">Institution Partnership</option>
          <option value="Technical Issue">Technical Issue</option>
          <option value="Feature Request">Feature Request</option>
          <option value="Press & Media">Press & Media</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="subject" className={styles.label}>
          Subject *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          className={styles.textarea}
          rows={8}
          required
        />
      </div>

      {statusState.status !== 'idle' && (
        <p
          className={styles.formStatus}
          aria-live="polite"
          data-status={statusState.status}
        >
          {statusState.message}
        </p>
      )}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={statusState.status === 'sending'}
      >
        {statusState.status === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
      </button>
    </form>
  );
}
