'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { School2, Globe, Search, MapPin } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstitutionModal from '@/components/modals/InstitutionModal';
import DeleteModal from '@/components/modals/DeleteModal';
import TutorialTooltip from '@/components/onboarding/TutorialTooltip';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import styles from '@/styles/modules/pages/institutions.module.scss';
import type { Institution } from '@/types/institution';

interface OnboardingData {
  onboarding_completed: boolean;
  current_step: string | null;
  steps_completed: string[];
}

interface InstitutionsPageProps {
  user: User;
  institutions: Institution[];
  onboarding: OnboardingData | null;
}

export default function InstitutionsPage({ user, institutions, onboarding }: InstitutionsPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | undefined>();
  
  const showOnboarding = !!(onboarding && !onboarding.onboarding_completed && onboarding.current_step === 'institutions' && !onboarding.steps_completed.includes('institutions'));

  const handleOnboardingComplete = () => {
    router.refresh();
  };

  const countries = Array.from(
    new Set(institutions.map(i => i.country).filter(Boolean))
  ).sort() as string[];

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = 
      institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.short_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || institution.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const getCourseCount = (institution: Institution) => {
    return institution.courses?.[0]?.count || 0;
  };

  const handleAddInstitution = () => {
    setSelectedInstitution(undefined);
    setIsModalOpen(true);
  };

  const handleEditInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsModalOpen(true);
  };

  const handleDeleteInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsDeleteModalOpen(true);
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Institutions</h1>
            <p className={styles.subtitle}>
              Browse institutions and their course catalogs
            </p>
          </div>
          <button className={styles.addButton} onClick={handleAddInstitution}>
            + Add Institution
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {countries.length > 0 && (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={styles.countrySelect}
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{filteredInstitutions.length}</span>
            <span className={styles.statLabel}>Institutions</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {filteredInstitutions.reduce((sum, i) => sum + getCourseCount(i), 0)}
            </span>
            <span className={styles.statLabel}>Total Courses</span>
          </div>
        </div>

        {/* Institutions Grid */}
        {filteredInstitutions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <School2 size={80} strokeWidth={1.5} />
            </div>
            <h3 className={styles.emptyTitle}>No institutions found</h3>
            <p className={styles.emptyText}>
              {searchQuery || selectedCountry !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first institution to get started'}
            </p>
          </div>
        ) : (
          <div className={styles.institutionsGrid}>
            {filteredInstitutions.map(institution => (
              <div key={institution.id} className={styles.institutionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.institutionIcon}>
                    <Globe size={32} strokeWidth={2} />
                  </div>
                  <div className={styles.cardBadge}>
                    {getCourseCount(institution)} courses
                  </div>
                </div>

                <h3 className={styles.institutionName}>{institution.name}</h3>
                <p className={styles.institutionCode}>{institution.short_code}</p>

                <div className={styles.institutionMeta}>
                  {institution.country && (
                    <span className={styles.metaItem}>
                      <MapPin size={14} strokeWidth={2} /> {institution.country}
                    </span>
                  )}
                  {institution.website && (
                    <a 
                      href={institution.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.websiteLink}
                    >
                      <Globe size={14} strokeWidth={2} /> Website
                    </a>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.primaryAction}>
                    View Courses
                  </button>
                  <button className={styles.secondaryAction} onClick={() => handleEditInstitution(institution)}>
                    Edit
                  </button>
                  <button className={styles.secondaryAction} onClick={() => handleDeleteInstitution(institution)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <InstitutionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          institution={selectedInstitution}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          itemType="institution"
          itemId={selectedInstitution?.id || ''}
          itemName={selectedInstitution?.name || ''}
        />

        <TutorialTooltip
          tutorialType="institutions"
          title="Add Your Institutions"
          description="Start by adding the colleges or universities where you've taken courses. Click the '+ Add Institution' button to get started!"
          position="bottom"
        />

        <OnboardingModal
          isOpen={showOnboarding}
          currentStep={onboarding?.current_step || 'dashboard_intro'}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </DashboardLayout>
  );
}
