'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Users, UserPlus, Mail, Shield, Calendar, Trash2, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import styles from '@/styles/modules/pages/institution-staff.module.scss';
import { Institution } from '@/types';

const staffSchema = z.object({
  email: z.string().email('Must be a valid email'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['institution_admin', 'institution_staff']),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  users: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
}

interface StaffPageProps {
  institution: Institution;
  staffMembers: StaffMember[];
}

export function StaffPage({ institution, staffMembers: initialStaffMembers }: StaffPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [staffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: 'institution_staff',
    },
  });

  const refreshStaff = () => {
    router.refresh();
  };

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post('/api/institution/staff', {
        email: data.email,
        name: data.name,
        role: data.role,
        institution_id: institution.id,
      });

      if (response.data.success) {
        setSuccessMessage('Staff member invited successfully!');
        showToast('Staff member invited successfully!', 'success');
        reset();
        setIsAddingStaff(false);
        setTimeout(() => {
          refreshStaff();
        }, 1000);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to invite staff member');
        showToast(err.response?.data?.error || 'Failed to invite staff member', 'error');
      } else {
        setError('An error occurred while inviting staff member');
        showToast('An error occurred while inviting staff member', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (staffId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${userEmail} from your institution?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.delete(`/api/institution/staff/${staffId}`);

      if (response.data.success) {
        setSuccessMessage('Staff member removed successfully');
        showToast('Staff member removed successfully', 'success');
        setTimeout(() => {
          refreshStaff();
        }, 1000);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to remove staff member');
        showToast(err.response?.data?.error || 'Failed to remove staff member', 'error');
      } else {
        setError('An error occurred while removing staff member');
        showToast('An error occurred while removing staff member', 'error');
      }
    }
  };

  console.log('Staff Members:', staffMembers);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <Users size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>Staff Management</h1>
            <p className={styles.subtitle}>Manage institution staff members and permissions</p>
          </div>
        </div>
        <button
          className={styles.addButton}
          onClick={() => {
            setIsAddingStaff(!isAddingStaff);
            setError(null);
            setSuccessMessage(null);
          }}
        >
          <UserPlus size={20} />
          {isAddingStaff ? 'Cancel' : 'Invite Staff'}
        </button>
      </div>

      {successMessage && (
        <div className={styles.successBox}>
          <Check size={20} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {isAddingStaff && (
        <div className={styles.addStaffForm}>
          <h2 className={styles.formTitle}>
            <UserPlus size={24} />
            Invite New Staff Member
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className={styles.input}
                  {...register('name')}
                  placeholder="e.g., Jane Smith"
                />
                {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address *
                </label>
                <div className={styles.inputWithIcon}>
                  <Mail size={20} />
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    {...register('email')}
                    placeholder="e.g., jane@university.edu"
                  />
                </div>
                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role" className={styles.label}>
                  Role *
                </label>
                <select id="role" className={styles.select} {...register('role')}>
                  <option value="institution_staff">Staff Member</option>
                  <option value="institution_admin">Administrator</option>
                </select>
                {errors.role && <span className={styles.fieldError}>{errors.role.message}</span>}
                <small className={styles.fieldHint}>
                  Admins can manage staff and institution settings
                </small>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setIsAddingStaff(false);
                  reset();
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Inviting...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.staffGrid}>
        {staffMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <p>No staff members yet</p>
            <button className={styles.addButton} onClick={() => setIsAddingStaff(true)}>
              <UserPlus size={20} />
              Invite First Staff Member
            </button>
          </div>
        ) : (
          staffMembers.map((member) => (
            <div key={member.id} className={styles.staffCard}>
              <div className={styles.staffHeader}>
                <div className={styles.staffAvatar}>
                  {(member.users.user_metadata?.name || member.users.email)[0]}
                </div>
                <div className={styles.staffInfo}>
                  <h3 className={styles.staffName}>
                    {member.users.user_metadata?.name || 'No Name'}
                  </h3>
                  <div className={styles.staffEmail}>
                    <Mail size={14} />
                    {member.users.email}
                  </div>
                </div>
              </div>

              <div className={styles.staffDetails}>
                <div className={styles.staffRole}>
                  <Shield size={16} />
                  <span>
                    {member.role === 'institution_admin' ? 'Administrator' : 'Staff Member'}
                  </span>
                </div>
                <div className={styles.staffDate}>
                  <Calendar size={16} />
                  <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.staffActions}>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(member.id, member.users.email)}
                  title="Remove staff member"
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
