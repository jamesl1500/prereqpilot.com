'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import styles from '@/styles/modules/pages/settings.module.scss';

interface SettingsPageProps {
  user: User;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const router = useRouter();
  
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get('/api/settings/profile');
      if (response.data.success) {
        setName(response.data.data.name || '');
        setEmail(response.data.data.email || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      await axios.put('/api/settings/profile', {
        name,
        email,
      });

      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
      router.refresh();
    } catch (error: any) {
      setProfileError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setPasswordLoading(false);
      return;
    }

    try {
      await axios.put('/api/settings/password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await axios.delete('/api/settings/account');
      // Redirect to login after successful deletion
      router.push('/login');
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <User size={24} strokeWidth={2} />
          <h2 className={styles.sectionTitle}>Profile Information</h2>
        </div>
        
        <form onSubmit={handleProfileUpdate} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputGroup}>
              <Mail size={20} strokeWidth={2} />
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <p className={styles.hint}>
              Changing your email will require verification
            </p>
          </div>

          {profileError && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className={styles.success}>
              <CheckCircle size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={profileLoading}
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Lock size={24} strokeWidth={2} />
          <h2 className={styles.sectionTitle}>Change Password</h2>
        </div>

        <form onSubmit={handlePasswordUpdate} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Current Password</label>
            <input
              type="password"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          {passwordError && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className={styles.success}>
              <CheckCircle size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className={`${styles.section} ${styles.dangerSection}`}>
        <div className={styles.sectionHeader}>
          <Trash2 size={24} strokeWidth={2} />
          <h2 className={styles.sectionTitle}>Danger Zone</h2>
        </div>

        <div className={styles.dangerContent}>
          <p className={styles.dangerText}>
            Once you delete your account, there is no going back. This action cannot be undone.
            All your data including courses, institutions, and scenarios will be permanently deleted.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className={styles.deleteConfirmation}>
              <p className={styles.deleteWarning}>
                Type <strong>DELETE</strong> to confirm account deletion
              </p>
              <input
                type="text"
                className={styles.input}
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE"
              />

              {deleteError && (
                <div className={styles.error}>
                  <AlertCircle size={16} />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                    setDeleteError('');
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
                >
                  {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
